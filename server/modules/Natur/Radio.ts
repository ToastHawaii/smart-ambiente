import * as SonosHttp from "../node-sonos-http-api";
import * as fs from "fs";
import { postJson, readFile } from "../../utils/request";
import { split, sortAlternate } from "../../utils/array";

import debug from "../../utils/debug";
const topic = debug("natur/controller", false);

const soundSource = "../../smart-ambiente-media/sound/natur/";
const channelApiUrls = [
  "http://192.168.1.112:8001/smart-ambiente/scene",
  "http://192.168.1.112:8002/smart-ambiente/scene"
];

const channelOutputUrls = [
  "http://localhost:8000/smart-ambiente/channel",
  "http://localhost:8000/smart-ambiente/channel/part/1"
];

const sonosHttp = SonosHttp.createClient();
let checkChannelTimeout: any = undefined;

function matchOrDefault(value: string, name: string, def: string) {
  const matches = value.match(
    new RegExp(`\(.*${name}=([a-z0-9\.\-]+).*\)`, "i")
  );

  if (matches && matches.length >= 3) return matches[2];
  else return def;
}

export async function playSound(
  scene:
    | "feuer"
    | "wind"
    | "regen"
    | "nordlicht"
    | "sonnenuntergang"
    | "bach"
    | "wasserfall"
    | "see"
    | "berg"
    | "meer"
    | "windspiel"
    | "bar"
    | "windturbine"
    | "bruecke"
    | "leuchturm"
) {
  let source = scene;

  const def = {
    volume: "1",
    pan: "none",
    crossfade: "0",
    random: "0"
  };
  const list = (await Promise.all(
    fs.readdirSync(soundSource + source).map(async f => ({
      ...(await getSource(soundSource + source, f)),
      volume: parseFloat(matchOrDefault(f, "volume", def.volume)).toString(),
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
    .favorite("Smart Ambiente")
    .play()
    .do();

  checkChannel();
}

export async function stopSound() {
  for (const channelUrl of channelApiUrls) {
    await postJson(channelUrl, []);
  }
  if (checkChannelTimeout) {
    clearTimeout(checkChannelTimeout);
    checkChannelTimeout = undefined;
  }
}

function checkChannel() {
  checkChannelTimeout = setTimeout(async () => {
    const state = await sonosHttp.room("Wohnzimmer").state();
    const playing = state.playbackState === "PLAYING";
    const uri = (state.currentTrack || { uri: "" }).uri || "";
    topic("radio check", { playing, uri, state });
    if (
      state.status !== "error" &&
      !(playing && uri.endsWith("smart-ambiente/channel"))
    ) {
      topic("radio stop");
      await stopSound();
    } else {
      checkChannel();
    }
  }, 60 * 1000);
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
