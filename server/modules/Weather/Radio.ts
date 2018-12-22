import * as SonosHttp from "../node-sonos-http-api";
import { Forecast, getTempFolder } from "./Forecast";
import * as fs from "fs";
import { postJson, readFile } from "../../utils/request";

import debug from "../../utils/debug";
const topic = debug("weather/controller", true);

const soundSource = "../../smart-ambiente-media/sound/weather/";
const channelApiUrls = [
  "http://192.168.1.112:8001/scene/weather",
  "http://192.168.1.112:8002/scene/weather"
];

const channelOutputUrls = [
  "http://localhost:8000/smart-ambiente/weather",
  "http://localhost:8000/smart-ambiente/weather/part/1"
];

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
  for (const channelUrl of channelApiUrls) {
    await postJson(channelUrl, []);
  }
}

export async function playSound(weather: Forecast) {
  topic("playSound", weather);
  let source = getTempFolder(weather.temperatur);

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
  )).filter(f => parseFloat(f.volume) >= 0.1);

  let i = 0;
  for (const chunk of split(sortAlternate(list), channelOutputUrls.length)) {
    if (i < channelOutputUrls.length - 1) {
      // use multiple instance of liquidsoap
      chunk.push({
        source: channelOutputUrls[i + 1],
        typ: "url",
        volume: "1",
        pan: "none",
        crossfade: "0",
        random: "0"
      });
    }

    topic("POST " + channelApiUrls[i], chunk);
    await postJson(channelApiUrls[i], chunk);
    i++;
  }

  await SonosHttp.createClient()
    .room("wohnzimmer")
    .favorite("Smart Ambiente - Wetter")
    .play()
    .do();
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

function split<T>(inputArray: T[], numberOfChunks: number) {
  const perChunk = Math.ceil(inputArray.length / numberOfChunks);
  topic("Chunks " + numberOfChunks + " size " + perChunk);

  return inputArray.reduce<T[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
}

function sortAlternate<T extends { random: string }>(a: T[]) {
  a.sort((a, b) => parseFloat(a.random) - parseFloat(b.random));
  const b = [];

  const l = a.length - 1; // micro optimization
  const L = l / 2; // micro optimization
  let i;
  for (i = 0; i < L; i++) b.push(a[l - i], a[i]);
  if (a.length % 2) b.push(a[i]); // add last item in odd arrays

  return b;
}
