import * as express from "express";
import * as bodyParser from "body-parser";
import { toArray, shuffle } from "./utils/array";
import { relative } from "./utils/math";
import * as SonosHttp from "./modules/node-sonos-http-api";
import * as HueHttp from "./modules/philips-hue-api";
import { Group } from "./modules/philips-hue-api";
import * as Events from "./modules/Events/Calendar";
import * as WeatherForecast from "./modules/Weather/Forecast";
import * as WeatherRadio from "./modules/Weather/Radio";
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
    "nordlicht",
    "sonnenuntergang",
    "bach",
    "wasserfall",
    "see",
    "berg",
    "meer",
    "windspiel",
    "bar",
    "windturbine",
    "bruecke",
    "leuchturm"
  ])[0];

  const weather = await WeatherForecast.query();
  data.kanal["wetter"] = weather;
  data.kanal["wetter"].mode = "vorhersage";

  const config = await loadConfig();
  data.sinn["aufwachen"] = config.aufwachen;
  data.kanal["alarm"] = config.alarm;
})();

app.get("/api/sinn/:sinn", async function(req, res) {
  if (first) {
    first = false;
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

  if (kanal === "musik") {
    controlTon();
  } else if (kanal === "wetter") {
    if (data.kanal["wetter"].mode === "vorhersage") {
      const weather = await WeatherForecast.query();
      data.kanal["wetter"] = weather;
      data.kanal["wetter"].mode = "vorhersage";

      controlTon();
      controlLicht();
    } else {
      controlTon();
      controlLicht();
    }
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
    } else {
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
  if (data.sinn["licht"].helligkeit === "viel") {
    const result = await hueHttp.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    for (const s of groups.filter(
      g => g.name === "Wohnzimmer" || g.name === "Terrasse"
    ))
      hueHttp.updateGroups(s.id, { on: true });
  } else if (data.sinn["licht"].helligkeit === "wenig") {
    const result = await hueHttp.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    for (const s of groups.filter(g => g.name === "Wohnzimmer"))
      hueHttp.updateGroups(s.id, { on: false });
    for (const s of groups.filter(g => g.name === "Terrasse"))
      hueHttp.updateGroups(s.id, { on: true });
  } else {
    const result = await hueHttp.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    for (const s of groups.filter(
      g => g.name === "Wohnzimmer" || g.name === "Terrasse"
    ))
      hueHttp.updateGroups(s.id, { on: false });
  }

  if (
    data.sinn["licht"].kanal === "sonnenaufgang" &&
    data.sinn["licht"].helligkeit !== "aus"
  ) {
    const result = await hueHttp.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    for (const s of groups.filter(g => g.name === "Wohnzimmer"))
      await hueHttp.updateGroups(s.id, { scene: "rvryxegf85dNSh4" });
    for (const s of groups.filter(g => g.name === "Terrasse"))
      await hueHttp.updateGroups(s.id, { scene: "bIt0VNlYGMp9Lz0" });
    for (const s of groups.filter(g => g.name === "Bad"))
      await hueHttp.updateGroups(s.id, { scene: "YvcDyf-5EkmsWYO" });
    for (const s of groups.filter(g => g.name === "Schlafzimmer"))
      await hueHttp.updateGroups(s.id, { scene: "wf1qGZeZVO13pcO" });
    hueHttp.updateSensorsState("58", { status: 0 });
  } else {
    hueHttp.updateSensorsState("58", { status: 1 });
  }

  if (
    data.sinn["licht"].kanal === "sonnenuntergang" &&
    data.sinn["licht"].helligkeit !== "aus"
  ) {
    const result = await hueHttp.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    for (const s of groups.filter(g => g.name === "Wohnzimmer"))
      await hueHttp.updateGroups(s.id, { scene: "TmGhD5UhpklGlEI" });
    for (const s of groups.filter(g => g.name === "Terrasse"))
      await hueHttp.updateGroups(s.id, { scene: "96W725qhw8W8wG7" });
    for (const s of groups.filter(g => g.name === "Bad"))
      await hueHttp.updateGroups(s.id, { scene: "YvcDyf-5EkmsWYO" });
    for (const s of groups.filter(g => g.name === "Schlafzimmer"))
      await hueHttp.updateGroups(s.id, { scene: "an-71pUpLRiCLNX" });
    hueHttp.updateSensorsState("38", { status: 0 });
  } else {
    hueHttp.updateSensorsState("38", { status: 1 });
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
