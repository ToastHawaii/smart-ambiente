import * as express from "express";
import * as bodyParser from "body-parser";
import { shuffle } from "./utils/array";
import { relative, hexToXy } from "./utils/math";
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
import moment = require("moment");
debug.enabled = true;
const topic = debug("server", false);

const sonos = SonosHttp.createClient();
const hue = HueHttp.createHueService(
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
    emotion: {
      emotion: "groll"
    },
    alarm: {
      zeit: "06:56",
      tage: "1-5"
    }
  }
};

(async function () {
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

app.get("/api/sinn", async function (_req, res) {
  res.json({ sinn: data.sinn["aktiv"] });
});

app.post("/api/sinn", async function (req, res) {
  data.sinn["aktiv"] = req.body.sinn;
  res.json({ sinn: data.sinn["aktiv"] });
});

app.get("/api/sinn/:sinn", async function (req, res) {
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

app.post("/api/sinn/:sinn", async function (req, res) {
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

app.get("/api/kanal/:kanal", async function (req, res) {
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

app.get("/api/kanal/wetter/image", function (_req, res) {
  res.json(chooseGoodMatch(data.kanal["wetter"]));
});

app.post("/api/kanal/:kanal", async function (req, res) {
  res.json(await setKanal(req.params.kanal, req.body));
});

export async function setKanal(kanal: string, kanalData: any) {
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
  } else if (kanal === "emotion") {
    controlLicht();
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

  await NaturRadio.stopSound();
  await WeatherRadio.stopSound();

  await delay(5 * 1000);

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
          playSender("Radio Swiss Jazz (Jazz)");
        } else if (data.kanal["musik"].stil === "gelassenheit") {
          playPlaylist("Blues");
        } else if (data.kanal["musik"].stil === "akzeptanz") {
          playPlaylist("Reggea");
        } else if (data.kanal["musik"].stil === "vertrauen") {
          playSender("Whisperings: Solo Piano Radio");
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

  if (data.sinn["licht"].kanal === "tageslicht") {
    await hue.updateAllHueLabToggle(/Auto\. Dimmen/g, 1);
  } else {
    await hue.updateAllHueLabToggle(/Auto\. Dimmen/g, 0);
  }

  if (data.sinn["licht"].helligkeit === "aus") {
    await hue.updateSensorsState("71", { status: 0 });
    await hue.updateSensorsState("72", { status: 0 });
    await hue.updateSensorsState("74", { status: 0 });
    await hue.updateSensorsState("75", { status: 0 });

    await hue.updateGroupsByName(
      ["Wohnzimmer", "Terrasse", "Toilette", "Schlafzimmer"],
      {
        on: false
      }
    );

    return;
  }

  if (data.sinn["licht"].kanal === "sonnenaufgang") {

    if (mode === "alarm") return;

    await hue.recallScene("Wohnzimmer", "Sonnenaufgang (1)");
    await hue.recallScene("Schlafzimmer", "Minimum");
    await hue.recallScenes(["Terrasse", "Toilette"], "Entspannen");

    await hue.updateSensorsState("71", { status: 1 });
    await hue.updateSensorsState("72", { status: 1 });

    return;
  }

  if (data.sinn["licht"].kanal === "sonnenuntergang") {
    await hue.recallScenes(
      ["Wohnzimmer", "Terrasse", "Toilette", "Schlafzimmer"],
      "Konzentration"
    );

    await hue.updateSensorsState("74", { status: 1 });
    await hue.updateSensorsState("75", { status: 1 });

    return;
  }

  const rooms = ["Terrasse"];

  await hue.updateGroupsByName(["Toilette", "Schlafzimmer"], {
    on: false
  });

  if (data.sinn["licht"].helligkeit === "viel") {
    rooms.push("Wohnzimmer");
  } else if (data.sinn["licht"].helligkeit === "überall") {
    rooms.push("Wohnzimmer");
    rooms.push("Toilette");
    rooms.push("Schlafzimmer");
  } else {
    await hue.updateGroupByName("Wohnzimmer", { on: false });
  }

  if (data.sinn["licht"].kanal === "entspannen") {
    await hue.recallScenes(rooms, "Entspannen");
  } else if (data.sinn["licht"].kanal === "aktivieren") {
    await hue.recallScenes(rooms, "Aktivieren");
  } else if (data.sinn["licht"].kanal === "emotion") {
    if (data.kanal["emotion"].emotion === "groll")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#d40000") });
    else if (data.kanal["emotion"].emotion === "erwartung")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#ff7d00") });
    else if (data.kanal["emotion"].emotion === "freude")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#ffe854") });
    else if (data.kanal["emotion"].emotion === "vertrauen")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#00b400") });
    else if (data.kanal["emotion"].emotion === "angst")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#007f00") });
    else if (data.kanal["emotion"].emotion === "überraschung")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#0089e0") });
    else if (data.kanal["emotion"].emotion === "traurigkeit")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#0000c8") });
    else if (data.kanal["emotion"].emotion === "abneigung")
      await hue.setLightStateByGroupByNames(rooms, { on: true, xy: hexToXy("#de00de") });
  } else {
    await hue.updateGroupsByName(rooms, {
      on: false
    });
    await hue.updateGroupsByName(rooms, {
      on: true
    });
  }
}

process.on("uncaughtException", function (err) {
  console.error(err.stack);
  topic("Node NOT Exiting...");
});

async function setLautstaerke(volume: number) {
  await sonos
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  await sonos
    .room("Bad")
    .volume(relative(volume, 25, 15))
    .do();
  await sonos
    .room("Schlafzimmer")
    .volume(relative(volume, 25, 80))
    .do();
}

app.get("/api/events/", function (_req, res) {
  res.json(Events.get());
});

app.get("/api/events.ics", function (_req, res) {
  res.end(Events.getIcal());
});

app.get("/api/events/:kategorie.ics", function (req, res) {
  res.end(Events.getIcal(req.params.kategorie));
});


app.get("/api/saison/", function (_req, res) {

  let saison = [
    { basisKategorie: "Gemüse", titel: "Artischocke ", bild: "/img/saison/Gemuese_Artischocke.jpg", start: 7, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Aubergine ", bild: "/img/saison/Gemuese_Aubergine.jpg", start: 6, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Batavia grün/rot ", bild: "/img/saison/Gemuese_Batavia_gruen_rot.jpg", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Blumenkohl ", bild: "/img/saison/Gemuese_Blumenkohl.jpg", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Bodenkohlrabi ", bild: "/img/saison/Gemuese_Bodenkohlrabi.jpg", start: 7, ende: 4 },
    { basisKategorie: "Gemüse", titel: "Bohnen ", bild: "/img/saison/Gemuese_Bohnen.jpg", start: 6, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Broccoli ", bild: "/img/saison/Gemuese_Broccoli.jpg", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Catalogna ", bild: "/img/saison/Gemuese_Catalogna.jpg", start: 5, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Chicorée ", bild: "/img/saison/Gemuese_Chicoree.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Chinakohl ", bild: "/img/saison/Gemuese_Chinakohl.jpg", start: 5, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Cicorino Rosso ", bild: "/img/saison/Gemuese_Cicorino_Rosso.jpg", start: 6, ende: 2 },
    { basisKategorie: "Gemüse", titel: "Eichblatt grün/rot ", bild: "/img/saison/Gemuese_Eichblatt_gruen_rot.jpg", start: 3, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Eisbergsalat ", bild: "/img/saison/Gemuese_Eisbergsalat.jpg", start: 4, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Endivie gekraust/glatt ", bild: "/img/saison/Gemuese_Endivie_gekraust_glatt.jpg", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Erbsen (frisch) ", bild: "/img/saison/Gemuese_Erbsen_frisch.jpg", start: 6, ende: 7 },
    { basisKategorie: "Gemüse", titel: "Federkohl / Grünkohl ", bild: "/img/saison/Gemuese_Federkohl_Gruenkohl.jpg", start: 11, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Fenchel ", bild: "/img/saison/Gemuese_Fenchel.jpg", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Gurke ", bild: "/img/saison/Gemuese_Gurke.jpg", start: 4, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Herbstrübe ", bild: "/img/saison/Gemuese_Herbstruebe.jpg", start: 9, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Kalettes", bild: "/img/saison/Gemuese_Kalettes.jpg", start: 11, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Kardy ", bild: "/img/saison/Gemuese_Kardy.jpg", start: 10, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Karotte ", bild: "/img/saison/Gemuese_Karotte.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Karotte Bund ", bild: "/img/saison/Gemuese_Karotte_Bund.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Kefen ", bild: "/img/saison/Gemuese_Kefen.jpg", start: 6, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Knoblauch ", bild: "/img/saison/Gemuese_Knoblauch.jpg", start: 7, ende: 4 },
    { basisKategorie: "Gemüse", titel: "Knollensellerie ", bild: "/img/saison/Gemuese_Knollensellerie.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Kohlrabi ", bild: "/img/saison/Gemuese_Kohlrabi.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Kopfsalat grün/rot ", bild: "/img/saison/Gemuese_Kopfsalat_gruen_rot.jpg", start: 2, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Krautstiel / Mangold ", bild: "/img/saison/Gemuese_Krautstiel_Mangold.jpg", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Kürbis ", bild: "/img/saison/Gemuese_Kuerbis.jpg", start: 8, ende: 2 },
    { basisKategorie: "Gemüse", titel: "Lattich ", bild: "/img/saison/Gemuese_Lattich.jpg", start: 5, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Lauch ", bild: "/img/saison/Gemuese_Lauch.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Lollo grün / rot ", bild: "/img/saison/Gemuese_Lollo_gruen_rot.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Mairübe ", bild: "/img/saison/Gemuese_Mairuebe.jpg", start: 4, ende: 6 },
    { basisKategorie: "Gemüse", titel: "Melone ", bild: "/img/saison/Gemuese_Melone.jpg", start: 6, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Nüsslisalat ", bild: "/img/saison/Gemuese_Nuesslisalat.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Pak-Choi ", bild: "/img/saison/Gemuese_Pak-Choi.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Pastinake ", bild: "/img/saison/Gemuese_Pastinake.jpg", start: 7, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Peperoni ", bild: "/img/saison/Gemuese_Peperoni.jpg", start: 6, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Petersilie ", bild: "/img/saison/Gemuese_Petersilie.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Pfälzerrübe ", bild: "/img/saison/Gemuese_Pfaelzerruebe.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Portulak ", bild: "/img/saison/Gemuese_Portulak.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Radieschen ", bild: "/img/saison/Gemuese_Radieschen.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rande ", bild: "/img/saison/Gemuese_Rande.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rettich ", bild: "/img/saison/Gemuese_Rettich.jpg", start: 3, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rhabarber ", bild: "/img/saison/Gemuese_Rhabarber.jpg", start: 4, ende: 6 },
    { basisKategorie: "Gemüse", titel: "Romanesco ", bild: "/img/saison/Gemuese_Romanesco.jpg", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Rosenkohl ", bild: "/img/saison/Gemuese_Rosenkohl.jpg", start: 9, ende: 2 },
    { basisKategorie: "Gemüse", titel: "Rotkabis ", bild: "/img/saison/Gemuese_Rotkabis.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rucola ", bild: "/img/saison/Gemuese_Rucola.jpg", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Salate aus Hydroproduktion ", bild: "/img/saison/Gemuese_Salate_aus_Hydroproduktion.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Schalotte ", bild: "/img/saison/Gemuese_Schalotte.jpg", start: 7, ende: 5 },
    { basisKategorie: "Gemüse", titel: "Schnittlauch ", bild: "/img/saison/Gemuese_Schnittlauch.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Schnittsalat ", bild: "/img/saison/Gemuese_Schnittsalat.jpg", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Schwarzwurzel ", bild: "/img/saison/Gemuese_Schwarzwurzel.jpg", start: 10, ende: 5 },
    { basisKategorie: "Gemüse", titel: "Spargel grün/weiss  ", bild: "/img/saison/Gemuese_Spargel_gruen_weiss.jpg", start: 4, ende: 6 },
    { basisKategorie: "Gemüse", titel: "Spinat ", bild: "/img/saison/Gemuese_Spinat.jpg", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Stangensellerie ", bild: "/img/saison/Gemuese_Stangensellerie.jpg", start: 5, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Tomate Cherry ", bild: "/img/saison/Gemuese_Tomate_Cherry.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Tomate Dattel ", bild: "/img/saison/Gemuese_Tomate_Dattel.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Tomate Peretti ", bild: "/img/saison/Gemuese_Tomate_Peretti.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Tomate Rispe ", bild: "/img/saison/Gemuese_Tomate_Rispe.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Tomate rund ", bild: "/img/saison/Gemuese_Tomate_rund.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Topinambur ", bild: "/img/saison/Gemuese_Topinambur.jpg", start: 11, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Weisskabis/Kohl", bild: "/img/saison/Gemuese_Weisskabis_Kohl.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Wirz ", bild: "/img/saison/Gemuese_Wirz.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Zucchetti ", bild: "/img/saison/Gemuese_Zucchetti.jpg", start: 5, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Zuckerhut ", bild: "/img/saison/Gemuese_Zuckerhut.jpg", start: 6, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Zwiebel ", bild: "/img/saison/Gemuese_Zwiebel.jpg", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Zwiebel Bund ", bild: "/img/saison/Gemuese_Zwiebel_Bund.jpg", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Zuckermais", bild: "/img/saison/Gemuese_Zuckermais.jpg", start: 8, ende: 11 },

  ];

  const currentMonth = moment().month() + 1;

  res.json(saison
    .filter(s => s.start <= s.ende ? currentMonth >= s.start && currentMonth <= s.ende : !(currentMonth > s.ende && currentMonth < s.start))
    .map(s => {
      return {
        basisKategorie: s.basisKategorie,
        titel: s.titel,
        bild: s.bild,
        start: moment().month(s.start - 1),
        ende: moment().month(s.ende - 1)
      }
    }));
});


app.get("/api/config/:name/", async function (req, res) {
  res.json((await loadConfig())[req.params.name]);
});
