import * as express from "express";
import * as bodyParser from "body-parser";
import { shuffle } from "./utils/array";
import { relative, hexToXy, getRandomInt } from "./utils/math";
import * as SonosHttp from "./os/node-sonos-http-api";
import * as HueHttp from "./os/philips-hue-api";
import * as Events from "./kanal/Events/Calendar";
import * as WeatherForecast from "./kanal/Weather/Forecast";
import * as WeatherRadio from "./kanal/Weather/Radio";
import * as NaturRadio from "./kanal/Natur/Radio";
import "./sinn/alarm";
import "./os/hue-sonos-link";
import { chooseGoodMatch } from "./kanal/Weather/Image";
import debug from "./utils/debug";
import { saveConfig, loadConfig } from "./utils/config";
import { delay } from "./utils/timer";
debug.enabled = true;
const topic = debug("server", false);

const sonos = SonosHttp.createClient();
const hue = HueHttp.createHueService(
  "http://192.168.178.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

const app = express();
app.use(express.static("out/wwwroot"));
app.use(express.static("../../smart-ambiente-media"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let first = true;

const data: {
  sinn: { [name: string]: any };
  kanal: { [name: string]: any };
} = {
  sinn: {
    aktiv: "ton",
    ton: {
      lautstaerke: "normal",
      kanal: "wetter"
    },
    bild: {
      bildschirm: "ein",
      kanal: "wetter"
    },
    licht: {
      helligkeit: "viel",
      kanal: "tageslicht"
    },
    aufwachen: {
      aktiv: "aus",
      kanal: "alarm"
    }
  },
  kanal: {
    wetter: {
      zeit: 0,
      wolken: 0,
      wind: 0,
      niederschlag: 0,
      radio: 0,
      temperatur: 0,
      mode: "vorhersage"
    },
    musik: {
      stil: "interesse"
    },
    ansehen: {
      ort: "schweiz"
    },
    natur: {
      szene: "wasserfall"
    },
    tour: {
      reise: "umrundungErde"
    },
    zusehen: {
      aktivitaet: "bahnverkehr"
    },
    szene: {
      szene: "wind"
    },
    emotion: {
      emotion: "groll"
    },
    alarm: {
      zeit: "06:56",
      tage: "1-5"
    }
  }
};

(async function() {
  data.kanal["natur"].szene = shuffle([
    "feuer",
    "wind",
    "regen",
    "gewitter",
    "nordlicht",
    "sonnenuntergang",
    "teich",
    "bach",
    "wasserfall",
    "see",
    "berg",
    "meer",
    "haus",
    "garten",
    "bar",
    "windturbine",
    "bruecke",
    "leuchturm"
  ])[0];

  const config = await loadConfig();
  data.sinn["aufwachen"] = config.aufwachen;
  data.kanal["alarm"] = config.alarm;
})();

app.get("/api/sinn", async function(_req, res) {
  res.json({ sinn: data.sinn["aktiv"] });
});

app.post("/api/sinn", async function(req, res) {
  data.sinn["aktiv"] = req.body.sinn;
  res.json({ sinn: data.sinn["aktiv"] });
});

app.get("/api/sinn/:sinn", async function(req, res) {
  if (first) {
    const weather = await WeatherForecast.query();
    data.kanal["wetter"] = weather;
    data.kanal["wetter"].mode = "vorhersage";
    first = false;

    controlTon();
    controlLicht();
  }

  res.json(data.sinn[req.params.sinn]);
});

app.post("/api/sinn/:sinn", async function(req, res) {
  res.json(await setSinn(req.params.sinn, req.body));
});

export async function setSinn(sinn: string, sinnData: any, mode?: string) {
  topic("Sinn", sinnData);
  first = false;

  data.sinn[sinn] = sinnData;

  if (sinn === "ton") controlTon();

  if (sinn === "licht") controlLicht(mode);

  if (sinn === "aufwachen")
    await saveConfig({
      aufwachen: data.sinn["aufwachen"],
      alarm: data.kanal["alarm"]
    });

  return data.sinn[sinn];
}

app.get("/api/kanal/:kanal", async function(req, res) {
  if (first) {
    const weather = await WeatherForecast.query();
    data.kanal["wetter"] = weather;
    data.kanal["wetter"].mode = "vorhersage";
    first = false;

    controlTon();
    controlLicht();
  }

  res.json(data.kanal[req.params.kanal]);
});

app.get("/api/kanal/wetter/image", function(_req, res) {
  res.json(chooseGoodMatch(data.kanal["wetter"]));
});

app.post("/api/kanal/:kanal", async function(req, res) {
  res.json(await setKanal(req.params.kanal, req.body));
});

export async function setKanal(kanal: string, kanalData: any, mode?: string) {
  topic("Kanal", kanalData);
  first = false;

  data.kanal[kanal] = kanalData;

  if (kanal === "musik" || kanal === "natur") {
    controlTon();
  } else if (kanal === "wetter") {
    if (data.kanal["wetter"].mode === "vorhersage") {
      const weather = await WeatherForecast.query();
      data.kanal["wetter"] = weather;
      data.kanal["wetter"].mode = "vorhersage";
    }

    controlTon();
  } else if (kanal === "alarm") {
    await saveConfig({
      aufwachen: data.sinn["aufwachen"],
      alarm: data.kanal["alarm"]
    });
  } else if (kanal === "szene") {
    controlLicht(mode);
  } else if (kanal === "emotion") {
    controlLicht(mode);
  }

  return data.kanal[kanal];
}

export function getKanal(kanal: string) {
  return data.kanal[kanal];
}

export function getSinn(sinn: string) {
  return data.sinn[sinn];
}

app.listen(3001);

async function controlTon() {
  await WeatherRadio.stopSound();
  await NaturRadio.stopSound();

  await delay(6 * 1000);

  if (
    data.sinn["ton"].lautstaerke !== "aus" &&
    data.sinn["ton"].lautstaerke !== "bild"
  ) {
    if (data.sinn["ton"].lautstaerke === "leise") {
      await setLautstaerke(8);
    } else if (data.sinn["ton"].lautstaerke === "normal") {
      await setLautstaerke(15);
    } else if (data.sinn["ton"].lautstaerke === "laut") {
      await setLautstaerke(25);
    } else {
      const lautstaerke = parseInt(data.sinn["ton"].lautstaerke, 10);
      await setLautstaerke(lautstaerke);

      if (lautstaerke >= 20) {
        data.sinn["ton"].lautstaerke = "laut";
      } else if (lautstaerke >= 12) {
        data.sinn["ton"].lautstaerke = "normal";
      } else if (lautstaerke >= 1) {
        data.sinn["ton"].lautstaerke = "leise";
      } else {
        data.sinn["ton"].lautstaerke = "aus";
      }
    }
    if (data.sinn["ton"].kanal === "wetter") {
      await WeatherRadio.playSound(data.kanal["wetter"]);
    } else if (data.sinn["ton"].kanal === "natur") {
      await NaturRadio.playSound(data.kanal["natur"].szene);
    } else {
      if (data.sinn["ton"].kanal === "musik") {
        if (data.kanal["musik"].stil === "interesse") {
          await playSender("Radio Swiss Jazz (Jazz)");
        } else if (data.kanal["musik"].stil === "gelassenheit") {
          await playPlaylist("Blues");
        } else if (data.kanal["musik"].stil === "akzeptanz") {
          await playPlaylist("Reggea");
        } else if (data.kanal["musik"].stil === "vertrauen") {
          await playSender("Whisperings: Solo Piano Radio");
        } else if (data.kanal["musik"].stil === "groll") {
          await playPlaylist("Punk");
        } else if (data.kanal["musik"].stil === "erwartung") {
          await playSender("Ska World");
        } else if (data.kanal["musik"].stil === "freude") {
          await playSender("Electro Swing Revolution Radio");
        } else if (data.kanal["musik"].stil === "wut") {
          await playPlaylist("Metal");
        } else if (data.kanal["musik"].stil === "umsicht") {
          await playPlaylist("Rock");
        }
      } else if (data.sinn["ton"].kanal === "nachrichten") {
        await playSender("SRF 4 News (Nachrichten)");
      } else if (data.sinn["ton"].kanal === "krimi") {
        await playPlaylist("Die haarstraeubenden Faelle des Philip Maloney");
      }
    }
  } else {
    await sonos
      .room("wohnzimmer")
      .pause()
      .do();
  }
}

async function playPlaylist(name: string) {
  await sonos
    .room("wohnzimmer")
    .groupMute()
    .pause()
    .shuffle("on")
    .playlist(name)
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .play()
    .do();
}

async function playSender(name: string) {
  await sonos
    .room("wohnzimmer")
    .favorite(name)
    .play()
    .do();
}

async function controlLicht(mode?: string) {
  const roomsOn = [];
  const roomsOff = [];

  if (data.sinn["licht"].helligkeit === "aus") {
    roomsOff.push("Decke");
    roomsOff.push("Wohnzimmer");
    roomsOff.push("Bad");
    roomsOff.push("Gang");
  } else if (data.sinn["licht"].helligkeit === "wenig") {
    roomsOn.push("Decke");
    roomsOff.push("Wohnzimmer");
    roomsOff.push("Bad");
    roomsOff.push("Gang");
  } else if (data.sinn["licht"].helligkeit === "viel") {
    roomsOn.push("Decke");
    roomsOn.push("Wohnzimmer");
    roomsOff.push("Bad");
    roomsOff.push("Gang");
  } /* data.sinn["licht"].helligkeit === "überall" */ else {
    roomsOn.push("Decke");
    roomsOn.push("Wohnzimmer");
    roomsOn.push("Bad");
    roomsOn.push("Gang");
  }

  if (data.sinn["licht"].kanal !== "tageslicht") {
    if (data.sinn["licht"].helligkeit !== "aus" || mode === "alarm")
      await hue.updateAllHueLabToggleByName(/Auto\. Dimmen/g, 0);
    // Default: Tageslicht
    else await hue.updateAllHueLabToggleByName(/Auto\. Dimmen/g, 1);
  }

  if (
    data.kanal["szene"].szene !== "sonnenaufgang" ||
    data.sinn["licht"].helligkeit === "aus"
  ) {
    await hue.updateHueLabToggle("71", 0);
    await hue.updateHueLabToggle("72", 0);
  }

  if (
    data.kanal["szene"].szene !== "sonnenuntergang" ||
    data.sinn["licht"].helligkeit === "aus"
  ) {
    await hue.updateHueLabToggle("74", 0);
    await hue.updateHueLabToggle("75", 0);
  }

  await hue.updateGroupsByName(roomsOff, { on: false });

  if (data.sinn["licht"].helligkeit === "aus") {
    return;
  }

  if (data.sinn["licht"].kanal === "entspannen") {
    await hue.recallScenes(roomsOn, "Entspannen");
  } else if (data.sinn["licht"].kanal === "aktivieren") {
    await hue.recallScenes(roomsOn, "Aktivieren");
  } else if (data.sinn["licht"].kanal === "tageslicht") {
    if (mode === "alarm") {
      await hue.updateAllHueLabToggleByName(/Auto\. Dimmen/g, 1);
      return;
    }

    await hue.updateGroupsByName(roomsOn, { on: false });
    await hue.updateAllHueLabToggleByName(/Auto\. Dimmen/g, 1);
    await hue.updateGroupsByName(roomsOff, { on: false });
    await hue.updateGroupsByName(roomsOn, { on: true });
  } else if (data.sinn["licht"].kanal === "szene") {
    if (data.kanal["szene"].szene === "sonnenaufgang") {
      if (mode === "alarm") return;

      await hue.recallScene("Wohnzimmer", "Sonnenaufgang (1)");
      await hue.recallScene("Gang", "Minimum");
      await hue.recallScenes(["Decke", "Bad"], "Entspannen");

      await hue.updateHueLabToggle("71", 1);
      await hue.updateHueLabToggle("72", 1);
    } else if (data.kanal["szene"].szene === "sonnenuntergang") {
      await hue.recallScenes(
        ["Wohnzimmer", "Decke", "Bad", "Gang"],
        "Konzentration"
      );

      await hue.updateHueLabToggle("74", 1);
      await hue.updateHueLabToggle("75", 1);
    } else if (data.kanal["szene"].szene === "wind") {
      hue.recallScene("Decke", "Blätterdach");
      wind();
    } else if (data.kanal["szene"].szene === "leuchturm") {
      leuchturm();
      wasser();
    }
  } /* data.sinn["licht"].kanal === "emotion" */ else {
    if (data.kanal["emotion"].emotion === "groll")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#d40000")
      });
    else if (data.kanal["emotion"].emotion === "erwartung")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#ff7d00")
      });
    else if (data.kanal["emotion"].emotion === "freude")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#ffe854")
      });
    else if (data.kanal["emotion"].emotion === "vertrauen")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#00b400")
      });
    else if (data.kanal["emotion"].emotion === "angst")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#007f00")
      });
    else if (data.kanal["emotion"].emotion === "überraschung")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#0089e0")
      });
    else if (data.kanal["emotion"].emotion === "traurigkeit")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#0000c8")
      });
    else if (data.kanal["emotion"].emotion === "abneigung")
      await hue.setLightStateByGroupByNames(roomsOn, {
        on: true,
        xy: hexToXy("#de00de")
      });
  }
}

process.on("uncaughtException", function(err) {
  console.error(err.stack);
  topic("Node NOT Exiting...");
});

async function setLautstaerke(volume: number) {
  await sonos
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  await sonos
    .room("Küche")
    .volume(relative(volume, 25, 15))
    .do();
  await sonos
    .room("Bad")
    .volume(relative(volume, 25, 80))
    .do();
}

app.get("/api/events/", function(_req, res) {
  res.json(Events.get());
});

app.get("/api/events.ics", function(_req, res) {
  res.end(Events.getIcal());
});

app.get("/api/events/:kategorie.ics", function(req, res) {
  res.end(Events.getIcal(req.params.kategorie));
});

app.get("/api/config/:name/", async function(req, res) {
  res.json((await loadConfig())[req.params.name]);
});

async function leuchturm(trigger: boolean = true) {
  if (trigger) {
    await hue.recallScene("Wohnzimmer", "Leuchturm (Ein)", 30);
  } else {
    await hue.recallScene("Wohnzimmer", "Leuchturm (Aus)", 30);
  }

  if (
    data.sinn["licht"].helligkeit !== "aus" &&
    data.sinn["licht"].kanal === "szene" &&
    data.kanal["szene"].szene === "leuchturm"
  )
    leuchturm(!trigger);
}

async function wasser(trigger: boolean = true) {
  if (trigger) {
    await hue.recallScene("Decke", "Minimum (Heiter)", 60);
  } else {
    await hue.recallScene("Decke", "Meer", 60);
  }

  if (
    data.sinn["licht"].helligkeit !== "aus" &&
    data.sinn["licht"].kanal === "szene" &&
    data.kanal["szene"].szene === "leuchturm"
  )
    wasser(!trigger);
}

async function wind() {
  await hue.recallScene("Wohnzimmer", "Wind " + getRandomInt(1, 4), 40);

  if (
    data.sinn["licht"].helligkeit !== "aus" &&
    data.sinn["licht"].kanal === "szene" &&
    data.kanal["szene"].szene === "wind"
  )
    wind();
}
