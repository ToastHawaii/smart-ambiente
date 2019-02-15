import * as express from "express";
import * as bodyParser from "body-parser";
import { shuffle } from "./utils/array";
import { relative } from "./utils/math";
import * as SonosHttp from "./modules/node-sonos-http-api";
import * as HueHttp from "./modules/philips-hue-api";
import * as Events from "./modules/Events/Calendar";
import * as WeatherForecast from "./modules/Weather/Forecast";
import * as WeatherRadio from "./modules/Weather/Radio";
import * as NaturRadio from "./modules/Natur/Radio";
import "./modules/alarm";
import "./modules/hue-sonos-link";
import { chooseGoodMatch } from "./modules/Weather/Image";
import debug from "./utils/debug";
import { saveConfig, loadConfig } from "./utils/config";
debug.enabled = true;
const topic = debug("server", false);

const sonosHttp = SonosHttp.createClient();
const hueHttp = HueHttp.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
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
    first = false;

    const weather = await WeatherForecast.query();
    data.kanal["wetter"] = weather;
    data.kanal["wetter"].mode = "vorhersage";

    controlTon();
    controlLicht();
  }

  res.json(data.sinn[req.params.sinn]);
});

app.post("/api/sinn/:sinn", async function(req, res) {
  res.json(await setSinn(req.params.sinn, req.body));
});

export async function setSinn(sinn: string, sinnData: any) {
  topic("Sinn", sinnData);

  data.sinn[sinn] = sinnData;

  if (sinn === "ton") controlTon();

  if (sinn === "licht") controlLicht();

  if (sinn === "aufwachen")
    await saveConfig({
      aufwachen: data.sinn["aufwachen"],
      alarm: data.kanal["alarm"]
    });

  return data.sinn[sinn];
}

app.get("/api/kanal/:kanal", function(req, res) {
  res.json(data.kanal[req.params.kanal]);
});

app.get("/api/kanal/wetter/image", function(_req, res) {
  res.json(chooseGoodMatch(data.kanal["wetter"]));
});

app.post("/api/kanal/:kanal", async function(req, res) {
  res.json(await setKanal(req.params.kanal, req.body));
});

export async function setKanal(kanal: string, kanalData: any) {
  topic("Kanal", kanalData);

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
    controlLicht();
  } else if (kanal === "alarm") {
    await saveConfig({
      aufwachen: data.sinn["aufwachen"],
      alarm: data.kanal["alarm"]
    });
  }

  return data.kanal[kanal];
}

export function getKanal(kanal: string) {
  return data.kanal[kanal];
}

app.listen(3001);

async function controlTon() {
  if (
    data.sinn["ton"].lautstaerke !== "aus" &&
    data.sinn["ton"].lautstaerke !== "bild"
  ) {
    if (data.sinn["ton"].lautstaerke === "leise") {
      setLautstaerke(8);
    } else if (data.sinn["ton"].lautstaerke === "normal") {
      setLautstaerke(15);
    } else if (data.sinn["ton"].lautstaerke === "laut") {
      setLautstaerke(25);
    } else {
      const lautstaerke = parseInt(data.sinn["ton"].lautstaerke, 10);
      setLautstaerke(lautstaerke);

      if (lautstaerke >= 25) {
        data.sinn["ton"].lautstaerke = "laut";
      } else if (lautstaerke >= 15) {
        data.sinn["ton"].lautstaerke = "normal";
      } else if (lautstaerke >= 8) {
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
      await NaturRadio.stopSound();
      await WeatherRadio.stopSound();

      if (data.sinn["ton"].kanal === "musik") {
        if (data.kanal["musik"].stil === "interesse") {
          playSender("Radio Swiss Jazz (Jazz)");
        } else if (data.kanal["musik"].stil === "gelassenheit") {
          playPlaylist("Blues");
        } else if (data.kanal["musik"].stil === "akzeptanz") {
          playPlaylist("Reggea");
        } else if (data.kanal["musik"].stil === "groll") {
          playPlaylist("Punk");
        } else if (data.kanal["musik"].stil === "erwartung") {
          playSender("Ska World");
        } else if (data.kanal["musik"].stil === "freude") {
          playSender("Electro Swing Revolution Radio");
        } else if (data.kanal["musik"].stil === "wut") {
          playPlaylist("Metal");
        } else if (data.kanal["musik"].stil === "umsicht") {
          playPlaylist("Rock");
        }
      } else if (data.sinn["ton"].kanal === "nachrichten") {
        playSender("SRF 4 News (Nachrichten)");
      } else if (data.sinn["ton"].kanal === "krimi") {
        playPlaylist("Die haarstraeubenden Faelle des Philip Maloney");
      }
    }
  } else {
    await sonosHttp
      .room("wohnzimmer")
      .pause()
      .do();

    await WeatherRadio.stopSound();
    await NaturRadio.stopSound();
  }
}

async function playPlaylist(name: string) {
  await sonosHttp
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
  await sonosHttp
    .room("wohnzimmer")
    .favorite(name)
    .play()
    .do();
}

async function controlLicht() {
  if (
    !(
      data.sinn["licht"].kanal === "sonnenaufgang" ||
      data.sinn["licht"].kanal === "sonnenuntergang"
    )
  ) {
    hueHttp.updateSensorsState("74", { status: 0 });
    hueHttp.updateSensorsState("75", { status: 0 });
    hueHttp.updateSensorsState("71", { status: 0 });
    hueHttp.updateSensorsState("72", { status: 0 });

    if (data.sinn["licht"].helligkeit === "viel") {
      if (data.sinn["licht"].kanal === "entspannen") {
        await hueHttp.recallScenes(["Wohnzimmer", "Terrasse"], "Entspannen");
      } else if (data.sinn["licht"].kanal === "aktivieren") {
        await hueHttp.recallScenes(["Wohnzimmer", "Terrasse"], "Aktivieren");
      } else {
        await hueHttp.updateGroupsByName(["Wohnzimmer", "Terrasse"], {
          on: false,
          transitiontime: 1
        });
        await hueHttp.updateGroupsByName(["Wohnzimmer", "Terrasse"], {
          on: true
        });
      }
    } else if (data.sinn["licht"].helligkeit === "wenig") {
      if (data.sinn["licht"].kanal === "entspannen") {
        await hueHttp.recallScene("Terrasse", "Entspannen");
      } else if (data.sinn["licht"].kanal === "aktivieren") {
        await hueHttp.recallScene("Terrasse", "Aktivieren");
      } else {
        await hueHttp.updateGroupByName("Terrasse", {
          on: false,
          transitiontime: 1
        });
        hueHttp.updateGroupByName("Terrasse", { on: true });
      }
      await hueHttp.updateGroupByName("Wohnzimmer", { on: false });
    } else {
      await hueHttp.updateGroupsByName(["Wohnzimmer", "Terrasse"], {
        on: false
      });
    }
  } else {
    if (
      data.sinn["licht"].kanal === "sonnenaufgang" &&
      data.sinn["licht"].helligkeit !== "aus"
    ) {
      hueHttp.recallScene("Wohnzimmer", "Sonnenaufgang (1)");
      hueHttp.recallScene("Schlafzimmer", "Minimum");
      await hueHttp.recallScenes(["Terrasse", "Bad"], "Entspannen");

      hueHttp.updateSensorsState("71", { status: 1 });
      hueHttp.updateSensorsState("72", { status: 1 });
    } else {
      hueHttp.updateSensorsState("71", { status: 0 });
      hueHttp.updateSensorsState("72", { status: 0 });
    }

    if (
      data.sinn["licht"].kanal === "sonnenuntergang" &&
      data.sinn["licht"].helligkeit !== "aus"
    ) {
      await hueHttp.recallScenes(
        ["Wohnzimmer", "Terrasse", "Bad", "Schlafzimmer"],
        "Konzentration"
      );

      hueHttp.updateSensorsState("74", { status: 1 });
      hueHttp.updateSensorsState("75", { status: 1 });
    } else {
      hueHttp.updateSensorsState("74", { status: 0 });
      hueHttp.updateSensorsState("75", { status: 0 });
    }
  }
}

process.on("uncaughtException", function(err) {
  console.error(err.stack);
  topic("Node NOT Exiting...");
});

async function setLautstaerke(volume: number) {
  await sonosHttp
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  await sonosHttp
    .room("Bad")
    .volume(relative(volume, 25, 15))
    .do();
  await sonosHttp
    .room("Schlafzimmer")
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
