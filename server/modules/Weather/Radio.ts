import * as SonosHttp from "../node-sonos-http-api";
import { Forecast } from "./Forecast";
import * as fs from "fs";
import { postJson, readFile } from "../../utils/request";

import debug from "../../utils/debug";
const topic = debug("weather/controller", false);

const soundSource = "../../smart-ambiente-media/sound/weather/";
const channelUrl = "http://192.168.1.112:8003/scene/weather";

function matchOrDefault(value: string, name: string, def: string) {
  const matches = value.match(
    new RegExp(`\(.*${name}=([a-z0-9\.\-]+).*\)`, "i")
  );

  if (matches && matches.length >= 3) return matches[2];
  else return def;
}

function typVolume(typ: string, weather: Forecast) {
  switch (typ) {
    case "precipitation":
      return weather.niederschlag;
    case "wind":
      return weather.wind;
    default:
      return 1;
  }
}

export async function stopSound() {
  await postJson(channelUrl, []);
}

export async function playSound(weather: Forecast) {
  topic("playSound", weather);
  if (weather.temperatur === 0 || weather.temperatur === 1) {
    let source = "";

    switch (weather.temperatur) {
      case 0:
        source += "icy";
        break;
      case 1:
        source += "cold";
        break;
    }
    const def = {
      volume: "1",
      pan: "none",
      crossfade: "0",
      random: "0",
      typ: "background"
    };
    const list = (await Promise.all(
      fs.readdirSync(soundSource + source).map(async f => ({
        ...(await getSource(soundSource + source, f)),
        volume: (
          parseFloat(matchOrDefault(f, "volume", def.volume)) *
          typVolume(matchOrDefault(f, "typ", def.typ), weather)
        ).toString(),
        pan: matchOrDefault(f, "pan", def.pan),
        crossfade: matchOrDefault(f, "crossfade", def.crossfade),
        random: matchOrDefault(f, "random", def.random)
      }))
    )).filter(f => parseFloat(f.volume) > 0.1);
    topic("POST", list);
    await postJson(channelUrl, list);
    await SonosHttp.createClient()
      .room("wohnzimmer")
      .favorite("Smart Ambiente - Wetter")
      .play()
      .do();
  } else {
    await postJson(channelUrl, []);
    let searchTerm = "Wetter - ";

    switch (weather.temperatur) {
      case 0:
        searchTerm += "Eisig";
        break;
      case 1:
        searchTerm += "Kalt";
        break;
      case 2:
        searchTerm += "Mild";
        break;
      case 3:
        searchTerm += "Warm";
        break;
      case 4:
        searchTerm += "Heiss";
        break;
    }

    if (weather.niederschlag >= 1) {
      searchTerm += ", Niederschlag";
    } else if (weather.wind >= 1) {
      searchTerm += ", Wind";
    }

    await SonosHttp.createClient()
      .room("wohnzimmer")
      .groupMute()
      .pause()
      .shuffle("on")
      .playlist(searchTerm)
      .groupUnmute()
      .crossfade("on")
      .repeat("on")
      .do();
  }
}

async function getSource(source: string, file: string) {
  if (!file.toUpperCase().endsWith(".TXT"))
    return {
      typ: "file",
      source: source + "/" + file
    };
  else
    return {
      typ: "url",
      source: await readFile(source + "/" + file)
    };
}