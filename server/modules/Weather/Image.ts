import * as fs from "fs";
import { random } from "../../utils/math";
import { shuffle } from "../../utils/array";
import { Forecast, getTempFolder } from "./Forecast";
import debug from "../../utils/debug";
debug.enabled = true;
const topic = debug("Weather/Image");

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
      weight: 2
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
          .filter(k => k)
          .map(k => {
            return {
              key: k.split("=")[0],
              value: k
                .split("=")[1]
                .split(",")
                .map(v => parseFloat(v))
            };
          })
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
          .reduce((a, b) => a + b, 0)
      };
    })
    .sort((a, b) => b.accuracy - a.accuracy);

  const rangedFiles: { file: string; max: number }[] = [];

  let max = 0;
  for (const f of files) {
    max += f.accuracy;
    rangedFiles.push({ file: f.file, max: max });
  }

  topic("files", files);
  const next = random(0, max);
  const file = rangedFiles.filter(f => f.max >= next)[0].file;

  return source + "/" + file;
}
