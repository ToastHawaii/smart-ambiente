import * as express from "express";
import * as bodyParser from "body-parser";

import * as SonosHttp from "./modules/node-sonos-http-api";
import * as HueHttp from "./modules/philips-hue-api";
import { Group } from "./modules/philips-hue-api";
import * as SimpleWeather from "./modules/SimpleWeather";
import * as Events from "./modules/Events/Calendar";
import { toArray } from "./utils";

import "./modules/alarm";
import "./modules/hue-sonos-link";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const sonosHttp = SonosHttp.createSonosService("http://localhost:5005");

const hueHttp = HueHttp.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

const app = express();
app.use(express.static("out/wwwroot"));
app.use(express.static("../smart-ambiente-media"));
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
    }
  },
  kanal: {
    wetter: {
      wolken: false,
      wind: false,
      niederschlag: false,
      nebel: false,
      gewitter: false,
      temperatur: "eisig",
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
    }
  }
};

SimpleWeather.createSimpleWeatherService().query(weather => {
  data.kanal["wetter"] = weather;
  data.kanal["wetter"].mode = "vorhersage";
});

app.get("/api/sinn/:sinn", function(req, res) {
  if (first) {
    first = false;
    controlTon();
    controlLicht();
  }

  res.json(data.sinn[req.params.sinn]);
});
app.post("/api/sinn/:sinn", function(req, res) {
  console.info("Sinn: " + JSON.stringify(req.body));

  data.sinn[req.params.sinn] = req.body;

  if (req.params.sinn === "ton") controlTon();

  if (req.params.sinn === "licht") controlLicht();

  res.sendStatus(200);
});
app.get("/api/kanal/:kanal", function(req, res) {
  res.json(data.kanal[req.params.kanal]);
});
app.post("/api/kanal/:kanal", function(req, res) {
  console.info("Kanal: " + JSON.stringify(req.body));

  data.kanal[req.params.kanal] = req.body;

  if (req.params.kanal === "musik") {
    controlTon();
    res.json(data.kanal[req.params.kanal]);
  } else if (req.params.kanal === "wetter") {
    if (data.kanal["wetter"].mode === "vorhersage")
      SimpleWeather.createSimpleWeatherService().query(weather => {
        data.kanal["wetter"] = weather;
        data.kanal["wetter"].mode = "vorhersage";

        controlTon();
        controlLicht();

        res.json(data.kanal[req.params.kanal]);
      });
    else {
      controlTon();
      controlLicht();

      res.json(data.kanal[req.params.kanal]);
    }
  }
});

app.listen(3001);

function controlTon() {
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
    } else if (data.sinn["ton"].lautstaerke === "sehrLaut") {
      setLautstaerke(35);
    }

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
    } else if (data.sinn["ton"].kanal === "wetter") {
      playWetter(data.kanal["wetter"]);
    }
  } else {
    sonosHttp
      .room("wohnzimmer")
      .pause()
      .do();
  }
}

function setLautstaerke(volume: number) {
  sonosHttp
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  sonosHttp
    .room("Bad")
    .volume(calcRelativeVolume(volume, 25, 15))
    .do();
  sonosHttp
    .room("Schlafzimmer")
    .volume(calcRelativeVolume(volume, 25, 80))
    .do();
}

function playPlaylist(name: string) {
  sonosHttp
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

function playSender(name: string) {
  sonosHttp
    .room("wohnzimmer")
    .favorite(name)
    .play()
    .do();
}

function controlLicht() {
  if (data.sinn["licht"].helligkeit === "viel") {
    hueHttp.queryGroups(result => {
      const groups = toArray<{ [index: string]: Group }, Group>(result);

      for (const s of groups.filter(
        g => g.name === "Wohnzimmer" || g.name === "Terrasse"
      ))
        hueHttp.updateGroups(s.id, { on: true });
    });
  } else if (data.sinn["licht"].helligkeit === "wenig") {
    hueHttp.queryGroups(result => {
      const groups = toArray<{ [index: string]: Group }, Group>(result);

      for (const s of groups.filter(g => g.name === "Wohnzimmer"))
        hueHttp.updateGroups(s.id, { on: false });
      for (const s of groups.filter(g => g.name === "Terrasse"))
        hueHttp.updateGroups(s.id, { on: true });
    });
  } else {
    hueHttp.queryGroups(result => {
      const groups = toArray<{ [index: string]: Group }, Group>(result);

      for (const s of groups.filter(
        g => g.name === "Wohnzimmer" || g.name === "Terrasse"
      ))
        hueHttp.updateGroups(s.id, { on: false });
    });
  }

  if (
    data.sinn["licht"].kanal === "sonnenaufgang" &&
    data.sinn["licht"].helligkeit !== "aus"
  ) {
    hueHttp.queryGroups(result => {
      const groups = toArray<{ [index: string]: Group }, Group>(result);

      for (const s of groups.filter(g => g.name === "Wohnzimmer"))
        hueHttp.updateGroups(s.id, { scene: "rvryxegf85dNSh4" });
      for (const s of groups.filter(g => g.name === "Terrasse"))
        hueHttp.updateGroups(s.id, { scene: "bIt0VNlYGMp9Lz0" });
      for (const s of groups.filter(g => g.name === "Bad"))
        hueHttp.updateGroups(s.id, { scene: "YvcDyf-5EkmsWYO" });
      for (const s of groups.filter(g => g.name === "Schlafzimmer"))
        hueHttp.updateGroups(s.id, { scene: "wf1qGZeZVO13pcO" });
    });
    hueHttp.updateSensorsState("58", { status: 0 });
  } else {
    hueHttp.updateSensorsState("58", { status: 1 });
  }

  if (
    data.sinn["licht"].kanal === "sonnenuntergang" &&
    data.sinn["licht"].helligkeit !== "aus"
  ) {
    hueHttp.queryGroups(result => {
      const groups = toArray<{ [index: string]: Group }, Group>(result);

      for (const s of groups.filter(g => g.name === "Wohnzimmer"))
        hueHttp.updateGroups(s.id, { scene: "TmGhD5UhpklGlEI" });
      for (const s of groups.filter(g => g.name === "Terrasse"))
        hueHttp.updateGroups(s.id, { scene: "96W725qhw8W8wG7" });
      for (const s of groups.filter(g => g.name === "Bad"))
        hueHttp.updateGroups(s.id, { scene: "YvcDyf-5EkmsWYO" });
      for (const s of groups.filter(g => g.name === "Schlafzimmer"))
        hueHttp.updateGroups(s.id, { scene: "an-71pUpLRiCLNX" });
    });
    hueHttp.updateSensorsState("38", { status: 0 });
  } else {
    hueHttp.updateSensorsState("38", { status: 1 });
  }
}

process.on("uncaughtException", function(err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

function playWetter(weather: SimpleWeather.Forecast, callback?: () => void) {
  let searchTerm = "Wetter - ";

  if (weather.gewitter) {
    searchTerm += "Unwetter";
  } else if (weather.nebel) {
    searchTerm += "Nebel";
  } else {
    switch (weather.temperatur) {
      case "eisig":
        searchTerm += "Eisig";
        break;
      case "kalt":
        searchTerm += "Kalt";
        break;
      case "mild":
        searchTerm += "Mild";
        break;
      case "warm":
        searchTerm += "Warm";
        break;
      case "heiss":
        searchTerm += "Heiss";
        break;
    }

    if (weather.niederschlag) {
      searchTerm += ", Niederschlag";
    } else if (weather.wind) {
      searchTerm += ", Wind";
    }
  }

  sonosHttp
    .room("wohnzimmer")
    .groupMute()
    .pause()
    .shuffle("on")
    .playlist(searchTerm)
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .do(callback);
}

function calcRelativeVolume(
  value: number,
  refRoomVolume: number,
  roomVolume: number
) {
  if (value >= refRoomVolume)
    return Math.round(
      (100 - roomVolume) *
        (1 / (100 - refRoomVolume)) *
        (value - refRoomVolume) +
        roomVolume
    );
  else
    return Math.round(
      roomVolume * (1 / refRoomVolume) * (value - refRoomVolume) + roomVolume
    );
}

app.get("/api/events/", function(_req, res) {
  res.json(Events.get());
});

app.get("/api/events.ics", function(_req, res) {
  res.end(Events.getIcal());
});
