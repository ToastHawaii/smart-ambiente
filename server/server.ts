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
    { basisKategorie: "Kartoffel", titel: "Agria", beschreibung: "vorwiegend mehlig kochend, vielseitig verwendbar, sehr gut lagerfähig", bild: "/img/saison/saisonkalender-agria.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Amandine", beschreibung: "festkochend, Frühkartoffel, nicht lagerfähig", bild: "/img/saison/saisonkalender-amandine.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Annabelle", beschreibung: "vorwiegend festkochend, Frühkartoffel, nicht lagerfähig", bild: "/img/saison/saisonkalender-annabelle.png", start: 1, ende: 12 },
    { basisKategorie: "Frucht", titel: "Aprikosen", beschreibung: "", bild: "/img/saison/saisonkalender-aprikosen.png", start: 6, ende: 8 },
    { basisKategorie: "Gemüse", titel: "Aubergine", beschreibung: "", bild: "/img/saison/saisonkalender-aubergine.png", start: 6, ende: 10 },
    { basisKategorie: "Pilz", titel: "Austernpilz", beschreibung: "", bild: "/img/saison/saisonkalender-austernpilze.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Bärlauch", beschreibung: "", bild: "/img/saison/saisonkalender-baerlauch.png", start: 3, ende: 4 },
    { basisKategorie: "Kraut/Blüte", titel: "Basilikum", beschreibung: "", bild: "/img/saison/saisonkalender-basilikum.png", start: 5, ende: 9 },
    { basisKategorie: "Salat", titel: "Bataviasalat", beschreibung: "", bild: "/img/saison/saisonkalender-batavia.png", start: 3, ende: 11 },
    { basisKategorie: "Apfel", titel: "Berner Rosen", beschreibung: "Für Schnitze. Bekannte alte Sorte mit typischem Sortengewürz. Wird rasch mehlig.", bild: "/img/saison/saisonkalender-bernerrosen.png", start: 9, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Bintje", beschreibung: "mehlig kochend, vielseitig verwendbar, sehr gut lagerfähig*", bild: "/img/saison/saisonkalender-bintje.png", start: 1, ende: 12 },
    { basisKategorie: "Frucht", titel: "Birnen", beschreibung: "", bild: "/img/saison/saisonkalender-birnen.png", start: 8, ende: 4 },
    { basisKategorie: "Gemüse", titel: "Blumenkohl", beschreibung: "", bild: "/img/saison/saisonkalender-blumenkohl.png", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Bodenkohlrabi", beschreibung: "", bild: "/img/saison/saisonkalender-bodenkolrabi.png", start: 7, ende: 4 },
    { basisKategorie: "Gemüse", titel: "Bohnen", beschreibung: "", bild: "/img/saison/saisonkalender-bohnen.png", start: 6, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Bohnenkraut", beschreibung: "", bild: "/img/saison/saisonkalender-bohnenkraut.png", start: 4, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Borretsch", beschreibung: "", bild: "/img/saison/saisonkalender-borretsch.png", start: 5, ende: 9 },
    { basisKategorie: "Apfel", titel: "Boskoop", beschreibung: "Für Mus, Küchlein, Tarte Tatin, Most. Saftige Sorte mit viel Zucker und Säure.", bild: "/img/saison/saisonkalender-boskop.png", start: 9, ende: 5 },
    { basisKategorie: "Apfel", titel: "Braeburn", beschreibung: "Tafelobst. Knackiger und festfleischiger Apfel mit angenehmem Zucker-Säure-Verhältnis.", bild: "/img/saison/saisonkalender-breaburn.png", start: 10, ende: 6 },
    { basisKategorie: "Kraut/Blüte", titel: "Brennessel", beschreibung: "", bild: "/img/saison/saisonkalender-brennessel.png", start: 3, ende: 5 },
    { basisKategorie: "Gemüse", titel: "Broccoli", beschreibung: "", bild: "/img/saison/saisonkalender-broccoli.png", start: 5, ende: 11 },
    { basisKategorie: "Beere", titel: "Brombeeren", beschreibung: "", bild: "/img/saison/saisonkalender-brombeeren.png", start: 7, ende: 9 },
    { basisKategorie: "Salat", titel: "Brunnenkresse", beschreibung: "", bild: "/img/saison/saisonkalender-brunnenkresse.png", start: 3, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Bundrüebli", beschreibung: "", bild: "/img/saison/saisonkalender-bundruebli.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Bundzwiebeln", beschreibung: "", bild: "/img/saison/saisonkalender-bundzwiebel.png", start: 4, ende: 11 },
    { basisKategorie: "Salat", titel: "Catalogna", beschreibung: "", bild: "/img/saison/saisonkalender-catalogna.png", start: 5, ende: 10 },
    { basisKategorie: "Pilz", titel: "Champignon", beschreibung: "", bild: "/img/saison/saisonkalender-champignon.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Charlotte", beschreibung: "festkochend, fein, feucht, gut lagerfähig", bild: "/img/saison/saisonkalender-charlotte.png", start: 1, ende: 12 },
    { basisKategorie: "Salat", titel: "Chicorée", beschreibung: "", bild: "/img/saison/saisonkalender-chicoree.png", start: 1, ende: 12 },
    { basisKategorie: "Salat", titel: "Chinakohl", beschreibung: "", bild: "/img/saison/saisonkalender-chinakohl.png", start: 5, ende: 3 },
    { basisKategorie: "Salat", titel: "Cicorino rosso", beschreibung: "", bild: "/img/saison/saisonkalender-cicorino-rosso.png", start: 6, ende: 2 },
    { basisKategorie: "Salat", titel: "Cicorino verde", beschreibung: "", bild: "/img/saison/saisonkalender-cicorino-verde.png", start: 3, ende: 5 },
    { basisKategorie: "Salat", titel: "Cima di rapa", beschreibung: "", bild: "/img/saison/saisonkalender-cima-di-rapa.png", start: 4, ende: 10 },
    { basisKategorie: "Apfel", titel: "Cox Orange", beschreibung: "Tafelobst, Mus, kleiner Pausenapfel. Apfel mit gutem, würzigem Aroma.", bild: "/img/saison/saisonkalender-cox-orange-2560x1664.jpeg", start: 9, ende: 2 },
    { basisKategorie: "Kartoffel", titel: "Désirée", beschreibung: "vorwiegend mehlig kochend, grobkörnig, rote Schale, lagerfähig", bild: "/img/saison/saisonkalender-desiree.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Dillkraut", beschreibung: "", bild: "/img/saison/saisonkalender-dillkraut.png", start: 4, ende: 9 },
    { basisKategorie: "Kartoffel", titel: "Ditta", beschreibung: "festkochend, fein, feucht, gut lagerfähig", bild: "/img/saison/saisonkalender-ditta.png", start: 1, ende: 12 },
    { basisKategorie: "Salat", titel: "Eichblattsalat", beschreibung: "", bild: "/img/saison/saisonkalender-eichblattsalat.png", start: 3, ende: 12 },
    { basisKategorie: "Pilz", titel: "Eierschwamm", beschreibung: "", bild: "/img/saison/saisonkalender-eierschwamm.png", start: 6, ende: 10 },
    { basisKategorie: "Salat", titel: "Eisbergsalat", beschreibung: "", bild: "/img/saison/saisinkalender-eisbergsalat.png", start: 4, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Eisenkraut (Verveine)", beschreibung: "", bild: "/img/saison/saisonkalender-eisenkraut.png", start: 6, ende: 8 },
    { basisKategorie: "Apfel", titel: "Elstar", beschreibung: "Zum Dörren. Saftiger und aromatischer Apfel mit erfrischender Säure.", bild: "/img/saison/saisonkalender-elstar.png", start: 9, ende: 3 },
    { basisKategorie: "Salat", titel: "Endivie", beschreibung: "", bild: "/img/saison/saisonkalender-endivie.png", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Erbse", beschreibung: "", bild: "/img/saison/saisonkalender-erbsen.png", start: 6, ende: 7 },
    { basisKategorie: "Beere", titel: "Erdbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-erdbeeren-removebg-preview.png", start: 5, ende: 9 },
    { basisKategorie: "Kraut/Blüte", titel: "Estragon", beschreibung: "", bild: "/img/saison/saisonkalender-estragon.png", start: 4, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Favebohnen", beschreibung: "", bild: "/img/saison/saisonkalender-favebohnen.png", start: 6, ende: 7 },
    { basisKategorie: "Gemüse", titel: "Federkohl", beschreibung: "", bild: "/img/saison/saisonkalender-federkohl.png", start: 8, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Fenchel", beschreibung: "", bild: "/img/saison/saisonkalender-fenchel.png", start: 5, ende: 11 },
    { basisKategorie: "Kartoffel", titel: "Frühkartoffel", beschreibung: "", bild: "/img/saison/saisonkalender-fruehkartoffeln.png", start: 6, ende: 8 },
    { basisKategorie: "Apfel", titel: "Gala", beschreibung: "Knackiger, saftiger und milder Apfel mit wenig Säure.", bild: "/img/saison/saisonkalender-gala-2560x1829.jpeg", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Gänseblümchen", beschreibung: "", bild: "/img/saison/saisonkalender-gaensebluemchen.png", start: 3, ende: 10 },
    { basisKategorie: "Salat", titel: "Gartenkresse", beschreibung: "", bild: "/img/saison/saisonkalender-gartenkresse.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Gemüsezwiebeln", beschreibung: "", bild: "/img/saison/saisonkalender-gemuesezwiebel.png", start: 8, ende: 12 },
    { basisKategorie: "Apfel", titel: "Glockenapfel", beschreibung: "Für Apfelschnitze. Tafelobst mit mässig intensivem Aroma und säuerlichem Geschmack.", bild: "/img/saison/saisonkalender-glockenapfel.jpg", start: 10, ende: 7 },
    { basisKategorie: "Apfel", titel: "Golden Delicious", beschreibung: "Für Küchlein, Schnitze. Süssliche Sorte mit angenehmem Aroma. Knackig und saftig.", bild: "/img/saison/saisonkalender-golden-delicisous.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Gourmandine", beschreibung: "vorwiegend festkochend, geeignet für Kartoffelsalat und Salzkartoffeln", bild: "/img/saison/saisonkalender-gourmandine.png", start: 1, ende: 12 },
    { basisKategorie: "Apfel", titel: "Granny Smith", beschreibung: "Tafelobst. Feste und saftige Sorte mit dezentem Aroma und spürbarer Säure.", bild: "/img/saison/saisonkalender-granny-smith.png", start: 11, ende: 3 },
    { basisKategorie: "Apfel", titel: "Gravensteiner", beschreibung: "Tafelobst, Mus. Sehr gute und  säuerliche Sorte mit ausgezeichnetem Aroma.", bild: "/img/saison/saisonkalender-gravensteiner.png", start: 8, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Gurke", beschreibung: "", bild: "/img/saison/saisonkalender-gurke.png", start: 4, ende: 10 },
    { basisKategorie: "Beere", titel: "Heidelbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-heidelbeeren-removebg-preview.png", start: 7, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Herbstrübe", beschreibung: "", bild: "/img/saison/saisonkalender-herbstruebe.png", start: 9, ende: 12 },
    { basisKategorie: "Pilz", titel: "Herbsttrompete", beschreibung: "", bild: "/img/saison/saisonkalender-herbsttrompeten.png", start: 9, ende: 10 },
    { basisKategorie: "Beere", titel: "Himbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-himbeeren.png", start: 6, ende: 9 },
    { basisKategorie: "Beere", titel: "Holunderbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-holunderbluete-1-2560x1643.jpeg", start: 8, ende: 9 },
    { basisKategorie: "Kraut/Blüte", titel: "Holunderblüte", beschreibung: "", bild: "/img/saison/saisonkalender-holunderbluete.png", start: 6, ende: 6 },
    { basisKategorie: "Apfel", titel: "Idared", beschreibung: "Knackiger, fester und schwach säuerlicher Apfel mit dezentem Aroma.", bild: "/img/saison/saisonkalender-idared-2560x1456.jpeg", start: 10, ende: 5 },
    { basisKategorie: "Kartoffel", titel: "Jelly", beschreibung: "vorwiegend festkochend, grossknollig, vielseitig verwendbar u.a. für Pommes Frites, sehr gut lagerfähig", bild: "/img/saison/saisonkalender-jelly.png", start: 1, ende: 12 },
    { basisKategorie: "Beere", titel: "Johannisbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-johannisbeeren.png", start: 7, ende: 8 },
    { basisKategorie: "Apfel", titel: "Jonagold", beschreibung: "Dörren, Wähe, Tarte Tatin. Saftiger und aromatischer Apfel mit ausgewogenem Zucker-Säureverhältnis.", bild: "/img/saison/saisonkalender-jonagold-2560x1415.jpg", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Kapuzinerblüte", beschreibung: "", bild: "/img/saison/saisonkalender-kapuzinerbluete.png", start: 6, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Kefe", beschreibung: "", bild: "/img/saison/saisonkalender-kefe.png", start: 6, ende: 9 },
    { basisKategorie: "Kraut/Blüte", titel: "Kerbel", beschreibung: "", bild: "/img/saison/saisonkalender-kerbel.png", start: 4, ende: 11 },
    { basisKategorie: "Frucht", titel: "Kirschen", beschreibung: "", bild: "/img/saison/saisonkalender-kirschen.png", start: 6, ende: 8 },
    { basisKategorie: "Apfel", titel: "Klarapfel", beschreibung: "Für Mus. Knackiger und säuerlicher Apfel. Früchte werden rasch mehlig. Wenige Tage haltbar.", bild: "/img/saison/saisonkalender-klaraapfel.png", start: 7, ende: 7 },
    { basisKategorie: "Gemüse", titel: "Knollensellerie", beschreibung: "", bild: "/img/saison/saisonkalender-knollensellerie.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Kohlrabi", beschreibung: "", bild: "/img/saison/saisonkalender-kohlrabi.png", start: 4, ende: 11 },
    { basisKategorie: "Salat", titel: "Kopfsalat", beschreibung: "", bild: "/img/saison/saisonkalender-kopfsalat.png", start: 2, ende: 12 },
    { basisKategorie: "Pilz", titel: "Kräuterseitling", beschreibung: "", bild: "/img/saison/saisonkalender-kraeuterseitling.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Krautstiel", beschreibung: "", bild: "/img/saison/saisonkalender-krautstiele.png", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Kürbis", beschreibung: "", bild: "/img/saison/saisonkalender-kuerbis.png", start: 8, ende: 2 },
    { basisKategorie: "Kartoffel", titel: "Lady Christl", beschreibung: "vorwiegend festkochend, Frühkartoffel, nicht lagerfähig", bild: "/img/saison/saisonkalender-christl.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Lady Felicia", beschreibung: "vorwiegend festkochend, feinkörnig, Frühkartoffel, nicht lagerfähig", bild: "/img/saison/saisonkalender-felicia.png", start: 1, ende: 12 },
    { basisKategorie: "Salat", titel: "Lattich", beschreibung: "", bild: "/img/saison/saisonkalender-lattich.png", start: 4, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Lauch", beschreibung: "", bild: "/img/saison/saisonkalender-lauch.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Liebstöckel", beschreibung: "", bild: "/img/saison/saisonkalender-liebstöckel.png", start: 4, ende: 10 },
    { basisKategorie: "Salat", titel: "Lollosalat", beschreibung: "", bild: "/img/saison/saisonkalender-lolosalat.png", start: 3, ende: 11 },
    { basisKategorie: "Salat", titel: "Löwenzahn", beschreibung: "", bild: "/img/saison/saisonkalender-loewenzahn.png", start: 12, ende: 4 },
    { basisKategorie: "Apfel", titel: "Maigold", beschreibung: "Tafelobst, Tarte Tatin. Fester, feinzelliger Apfel mit angenehmem Aroma.", bild: "/img/saison/saisonkalender-rubinette-2560x1506.jpeg", start: 10, ende: 8 },
    { basisKategorie: "Gemüse", titel: "Mairübe", beschreibung: "", bild: "/img/saison/saisonkalender-mairuebe.png", start: 4, ende: 6 },
    { basisKategorie: "Kraut/Blüte", titel: "Majoran", beschreibung: "", bild: "/img/saison/saisonkalender-majoran.png", start: 4, ende: 11 },
    { basisKategorie: "Apfel", titel: "Milwa (Diwa)", beschreibung: "Knackige und saftige Sorte mit angenehmem Aroma und gutem Zucker-Säure-Verhältnis.", bild: "/img/saison/saisonkalender-milwa-diva-1.png", start: 11, ende: 6 },
    { basisKategorie: "Kraut/Blüte", titel: "Minze", beschreibung: "", bild: "/img/saison/saisonkalender-minze.png", start: 4, ende: 11 },
    { basisKategorie: "Frucht", titel: "Mirabellen", beschreibung: "", bild: "/img/saison/saisonkalender-mirabellen-2560x1707.jpeg", start: 8, ende: 9 },
    { basisKategorie: "Pilz", titel: "Morchel", beschreibung: "", bild: "/img/saison/saisonkalender-morchel.png", start: 3, ende: 5 },
    { basisKategorie: "Frucht", titel: "Nektarinen", beschreibung: "", bild: "/img/saison/saisonkalender-nektarinen.png", start: 7, ende: 8 },
    { basisKategorie: "Salat", titel: "Nüsslisalat", beschreibung: "", bild: "/img/saison/saisonkalender-nuesslisalat.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Oregano", beschreibung: "", bild: "/img/saison/saisonkalender-oregano.png", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Pastinake", beschreibung: "", bild: "/img/saison/saisonkalender-pastinake.png", start: 7, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Patisson", beschreibung: "", bild: "/img/saison/saisonkalender-patisson.png", start: 6, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Pelargonie (Duftgeranie)", beschreibung: "", bild: "/img/saison/saisonkalender-duftgeranie.png", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Peperoni", beschreibung: "", bild: "/img/saison/saisonkalender-peperoni.png", start: 6, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Petersilie", beschreibung: "", bild: "/img/saison/saisonkalender-petersilie.png", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Pfälzerrüebli", beschreibung: "", bild: "/img/saison/saisonkalender-pfalzerruebe.png", start: 1, ende: 12 },
    { basisKategorie: "Frucht", titel: "Pfirsiche", beschreibung: "", bild: "/img/saison/saisonkalender-pfirsiche-2560x1990.jpeg", start: 7, ende: 8 },
    { basisKategorie: "Frucht", titel: "Pflaumen", beschreibung: "", bild: "/img/saison/saisonkalender-pflaumen-2560x1707.jpeg", start: 8, ende: 9 },
    { basisKategorie: "Salat", titel: "Portulak", beschreibung: "", bild: "/img/saison/saisonkalender-portulak.png", start: 1, ende: 12 },
    { basisKategorie: "Beere", titel: "Preiselbeere", beschreibung: "", bild: "/img/saison/saisonkalender-preiselbeeren.png", start: 7, ende: 9 },
    { basisKategorie: "Frucht", titel: "Quitten", beschreibung: "", bild: "/img/saison/saisonkalender-quitten.png", start: 9, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Radieschen", beschreibung: "", bild: "/img/saison/saisonkalender-radisschen.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Randen", beschreibung: "", bild: "/img/saison/saisonkalender-randen.png", start: 1, ende: 12 },
    { basisKategorie: "Kartoffel", titel: "Ratte", beschreibung: "festkochend, fein, feucht, lang, hörnchenförmig, beschränkt lagerfähig", bild: "/img/saison/saisonkalender-ratte-1-2560x1741.jpeg", start: 1, ende: 12 },
    { basisKategorie: "Frucht", titel: "Reineclauden", beschreibung: "", bild: "/img/saison/saisonkalender-reineclauden.png", start: 8, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Rettich", beschreibung: "", bild: "/img/saison/saisonkalender-weisserrettich.png", start: 3, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rhabarber", beschreibung: "", bild: "/img/saison/saisonkalender-rhabarber.png", start: 4, ende: 6 },
    { basisKategorie: "Kraut/Blüte", titel: "Ringelblume (Calendula)", beschreibung: "", bild: "/img/saison/saisonkalender-ringelblume.png", start: 4, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Romanesco", beschreibung: "", bild: "/img/saison/saisonkalender-romanseco.png", start: 5, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Rondini", beschreibung: "", bild: "/img/saison/saisonkalender-rondoni.png", start: 6, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Rosenblüten", beschreibung: "", bild: "/img/saison/saisonkalender-rosenbluete.png", start: 5, ende: 9 },
    { basisKategorie: "Gemüse", titel: "Rosenkohl", beschreibung: "", bild: "/img/saison/saisonkalender-rosenkohl.png", start: 9, ende: 2 },
    { basisKategorie: "Kraut/Blüte", titel: "Rosmarin", beschreibung: "", bild: "/img/saison/saisonkalender-rosmarin.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Rotkraut", beschreibung: "", bild: "/img/saison/saisonkalender-rotkraut.png", start: 1, ende: 12 },
    { basisKategorie: "Apfel", titel: "Rubinette", beschreibung: "Kleiner Pausenapfel. Sehr aromatische und leicht säuerliche Sorte.", bild: "/img/saison/saisonkalender-rubinette.png", start: 9, ende: 1 },
    { basisKategorie: "Salat", titel: "Rucola", beschreibung: "", bild: "/img/saison/saisonkalender-rucola.png", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Rüebli", beschreibung: "", bild: "/img/saison/saisonkalender-ruebli.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Salbei", beschreibung: "", bild: "/img/saison/saisonkalender-salbei.png", start: 4, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Sauerampfer", beschreibung: "", bild: "/img/saison/saisonkalender-sauerampfer.png", start: 4, ende: 6 },
    { basisKategorie: "Apfel", titel: "Sauergrauech", beschreibung: "Für Mus, fein gerieben mit Quark, Most. Knackiger, saftiger und erfrischend säuerlicher Apfel.", bild: "/img/saison/saisonkalender-sauergrauech.png", start: 8, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Schnittlauch", beschreibung: "", bild: "/img/saison/saisonkalender-schnittlauch.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Schnittmangold", beschreibung: "", bild: "/img/saison/saisonkalender-schnittmangold.png", start: 6, ende: 10 },
    { basisKategorie: "Salat", titel: "Schnittsalat", beschreibung: "", bild: "/img/saison/saisonsalat-schnittsalat.png", start: 3, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Schwarzwurzel", beschreibung: "", bild: "/img/saison/saisonkalender-schwarzwurzel.png", start: 10, ende: 5 },
    { basisKategorie: "Pilz", titel: "Shiitake", beschreibung: "", bild: "/img/saison/saisonkalender-shiitake.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Spargeln grün, weiss", beschreibung: "", bild: "/img/saison/saisonkalender-spargeln-removebg-preview-2.png", start: 4, ende: 6 },
    { basisKategorie: "Salat", titel: "Spinat", beschreibung: "", bild: "/img/saison/saisonsalat-spinat.png", start: 3, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Spinat", beschreibung: "", bild: "/img/saison/saisonkalender-spinat.png", start: 3, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Spitzkabis", beschreibung: "", bild: "/img/saison/saisonkalender-spitzkabis.png", start: 5, ende: 7 },
    { basisKategorie: "Beere", titel: "Stachelbeeren", beschreibung: "", bild: "/img/saison/saisonkalender-stachelbeere.png", start: 7, ende: 7 },
    { basisKategorie: "Gemüse", titel: "Stangensellerie", beschreibung: "", bild: "/img/saison/saisonkalender-stangensellerie.png", start: 5, ende: 12 },
    { basisKategorie: "Pilz", titel: "Steinpilz", beschreibung: "", bild: "/img/saison/saisonkalender-steinpilz.png", start: 6, ende: 10 },
    { basisKategorie: "Apfel", titel: "Summerred", beschreibung: "Süss-säuerliche, nicht sehr festfleischige Sorte mit dezentem Aroma.", bild: "/img/saison/saisonkalender-summerred-nicht-gefunden.png", start: 8, ende: 10 },
    { basisKategorie: "Kartoffel", titel: "Süsskartoffel", beschreibung: "", bild: "/img/saison/saisonkalender-suesskartoffel.png", start: 9, ende: 4 },
    { basisKategorie: "Kraut/Blüte", titel: "Thymian", beschreibung: "", bild: "/img/saison/saisonkalender-thymian.png", start: 4, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Tomate", beschreibung: "", bild: "/img/saison/saisonkalender-tomate.png", start: 4, ende: 11 },
    { basisKategorie: "Apfel", titel: "Topaz", beschreibung: "Knackiger und saftiger Apfel mit gutem Aroma und erfrischender Säure.", bild: "/img/saison/saisonkalender-topaz.png", start: 10, ende: 5 },
    { basisKategorie: "Gemüse", titel: "Topinambur", beschreibung: "", bild: "/img/saison/saisonkalender-topinambur.png", start: 11, ende: 3 },
    { basisKategorie: "Frucht", titel: "Trauben", beschreibung: "", bild: "/img/saison/saisonkalender-trauben.png", start: 9, ende: 10 },
    { basisKategorie: "Pilz", titel: "Trüffel schwarz", beschreibung: "", bild: "/img/saison/saisonkalender-trueffel-schwarz.png", start: 12, ende: 3 },
    { basisKategorie: "Pilz", titel: "Trüffel weiss", beschreibung: "", bild: "/img/saison/saisonkalender-trueffel-weiss.png", start: 10, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Veilchen", beschreibung: "", bild: "/img/saison/saisonkalender-veilchen.png", start: 3, ende: 5 },
    { basisKategorie: "Kartoffel", titel: "Victoria", beschreibung: "vorwiegend festkochend, vielseitig verwendbar, sehr gut lagerfähig", bild: "/img/saison/saisonkalender-victoria.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Waldmeister", beschreibung: "", bild: "/img/saison/saisonkalender-waldmeister.png", start: 5, ende: 6 },
    { basisKategorie: "Gemüse", titel: "Weisskabis", beschreibung: "", bild: "/img/saison/saisonkalender-weisskabis.png", start: 1, ende: 12 },
    { basisKategorie: "Gemüse", titel: "Wirz", beschreibung: "", bild: "/img/saison/saisonkalender-wirz.png", start: 1, ende: 12 },
    { basisKategorie: "Kraut/Blüte", titel: "Ysop", beschreibung: "", bild: "/img/saison/saisonkalender-ysop.png", start: 5, ende: 10 },
    { basisKategorie: "Kraut/Blüte", titel: "Zitronenmelisse", beschreibung: "", bild: "/img/saison/saisonkalender-zitronenmelisse.png", start: 4, ende: 11 },
    { basisKategorie: "Gemüse", titel: "Zucchetti", beschreibung: "", bild: "/img/saison/saisonkalender-zucchetti.png", start: 5, ende: 10 },
    { basisKategorie: "Salat", titel: "Zuckerhut", beschreibung: "", bild: "/img/saison/saisonkalender-zuckerhut-1.png", start: 6, ende: 3 },
    { basisKategorie: "Gemüse", titel: "Zuckermais", beschreibung: "", bild: "/img/saison/saisonkalender-zuckermais.png", start: 8, ende: 11 },
    { basisKategorie: "Frucht", titel: "Zwetschgen", beschreibung: "", bild: "/img/saison/saisonkalender-zwetschgen.png", start: 7, ende: 10 },
    { basisKategorie: "Gemüse", titel: "Zwiebel", beschreibung: "", bild: "/img/saison/saisonkalender-gemuesezwiebel.png", start: 1, ende: 12 },

  ];

  const currentMonth = moment().month() + 1;

  res.json(saison
    .filter(s => s.start <= s.ende ? currentMonth >= s.start && currentMonth <= s.ende : !(currentMonth > s.ende && currentMonth < s.start))
    .map(s => {
      return {
        basisKategorie: s.basisKategorie,
        titel: s.titel,
        beschreibung: s.beschreibung,
        bild: s.bild,
        start: moment().month(s.start - 1),
        ende: moment().month(s.ende - 1)
      }
    }));
});


app.get("/api/config/:name/", async function (req, res) {
  res.json((await loadConfig())[req.params.name]);
});
