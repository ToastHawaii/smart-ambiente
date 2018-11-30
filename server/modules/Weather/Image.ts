import * as fs from "fs";
import { random } from "../../utils/math";
import { shuffle } from "../../utils/array";
import { Forecast, getTempFolder } from "./Forecast";
import debug from "../../utils/debug";
const topic = debug("Weather/Image", false);

const imgSource = "../../smart-ambiente-media/img/weather/";

export function chooseGoodMatch(weather: Forecast) {
  const kategories: {
    [name: string]: {
      maxDeviation: number;
      current: number;
      weight: number;
    };
  } = {
    zeit: {
      maxDeviation: 2,
      current: weather.zeit,
      weight: 3
    },
    wolken: {
      maxDeviation: 1,
      current: weather.wolken,
      weight: 2
    },
    wind: {
      maxDeviation: 1,
      current: weather.wind,
      weight: 1
    },
    niederschlag: {
      maxDeviation: 1,
      current: weather.niederschlag,
      weight: 1
    }
  };
  topic("kategories", kategories);

  let source = getTempFolder(weather.temperatur);
  const list = fs.readdirSync(imgSource + source);
  const files = shuffle(list)
    .map(i => {
      return {
        file: i,
        kategories: (
          (i.replace(/ ?\([0-9]+\)/g, "") || "").replace(/\.[a-z0-9]+/g, "") ||
          ""
        )
          .split(" ")
          .filter(k => k && k.split("=")[0] !== "allow")
          .map(k => {
            return {
              key: k.split("=")[0],
              value: k
                .split("=")[1]
                .split(",")
                .map(v => parseFloat(v))
            };
          }),
        effects:
          (
            (i.replace(/ ?\([0-9]+\)/g, "") || "").replace(
              /\.[a-z0-9]+/g,
              ""
            ) || ""
          )
            .split(" ")
            .filter(k => k && k.split("=")[0] === "allow")
            .map(k => k.split("=")[1].split(","))[0] || []
      };
    })
    .map(f => {
      topic("file", f);
      return {
        file: f.file,
        accuracy: f.kategories
          .map(k => {
            const kategorie = kategories[k.key];
            const minAbstand = Math.min(
              ...k.value.map(v => Math.abs(v - kategorie.current))
            );
            return (1 - minAbstand / kategorie.maxDeviation) * kategorie.weight;
          })
          .reduce((a, b) => a + b, 0),
        effects: f.effects
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);

  const rangedFiles: { file: string; effects: string[]; max: number }[] = [];

  let max = 0;
  for (const f of files) {
    max += f.accuracy;
    rangedFiles.push({ file: f.file, effects: f.effects, max: max });
  }

  topic("files", files);
  const next = random(0, max);
  const file = rangedFiles
    .filter(f => f.max >= next)
    .map(f => ({ src: source + "/" + f.file, effects: f.effects }))[0];

  return file;
}
