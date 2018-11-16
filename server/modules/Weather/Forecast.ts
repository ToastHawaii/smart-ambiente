import * as Owm from "./openweathermap";
// import * as fs from "fs";
import * as moment from "moment";
import { midrange } from "../../utils/math";

export interface Forecast {
  zeit: number;
  wolken: number;
  wind: number;
  niederschlag: number;
  temperatur: number;
}

function getTime() {
  return (
    (2 / (12 * 60)) *
    (12 * 60 -
      Math.abs(moment.duration(moment().format("HH:mm")).asMinutes() - 12 * 60))
  );
}

function getPrecipitation(forecast: Owm.Forecast) {
  return midrange(
    ...forecast.list.map(
      s =>
        (1 / 0.3) * ((s.rain && s.rain["3h"]) || (s.snow && s.snow["3h"]) || 0)
    )
  );
}

function getWind(forecast: Owm.Forecast) {
  return midrange(
    ...forecast.list.map(s => (1 / 5) /* 5 m/s = 18 km/h */ * s.wind.speed)
  );
}

function getCloudiness(forecast: Owm.Forecast) {
  return midrange(...forecast.list.map(s => s.clouds.all)) / 100;
}

function getTemp(forecast: Owm.Forecast): number {
  const temp = midrange(...forecast.list.map(s => s.main.temp));

  if (temp < 4) return Temperatur.Eisig;

  if (temp < 12) return Temperatur.Kalt;

  if (temp < 18) return Temperatur.Mild;

  if (temp < 22) return Temperatur.Warm;

  return Temperatur.Heiss;
}

export enum Temperatur {
  Eisig,
  Kalt,
  Mild,
  Warm,
  Heiss
}

export enum Zeit {
  Nacht,
  Daemmerung,
  Tag
}

export enum Himmel {
  Klar,
  Bewoelkt
}

export enum Niederschlag {
  Trocken,
  Niederschlag
}

export enum Wind {
  Still,
  Windig
}

export async function query() {
  let forecast = await Owm.createOwmService(
    "1b7711f9c2aeb2429128f1b33f63219c"
  ).queryForecast();

  forecast = forecast || ({} as any);
  forecast.list = forecast.list || ([] as any);

  return {
    temperatur: getTemp(forecast),
    zeit: getTime(),
    wolken: getCloudiness(forecast),
    wind: getWind(forecast),
    niederschlag: getPrecipitation(forecast)
  } as Forecast;

  // const kategories: {
  //   [name: string]: {
  //     maxDeviation: number;
  //     current: number;
  //     weight: number;
  //     mapping:
  //       | typeof Temperatur
  //       | typeof Zeit
  //       | typeof Himmel
  //       | typeof Wind
  //       | typeof Niederschlag;
  //   };
  // } = {
  //   Ort: {
  //     maxDeviation: 1,
  //     current: getTemp(forecast),
  //     weight: 6,
  //     mapping: Temperatur
  //   },
  //   Zeit: {
  //     maxDeviation: 2,
  //     current: getTime(),
  //     weight: 2,
  //     mapping: Zeit
  //   },
  //   Himmel: {
  //     maxDeviation: 1,
  //     current: getCloudiness(forecast),
  //     weight: 2,
  //     mapping: Himmel
  //   },
  //   Wind: {
  //     maxDeviation: 1,
  //     current: getWind(forecast),
  //     weight: 1,
  //     mapping: Wind
  //   },
  //   Niederschlag: {
  //     maxDeviation: 1,
  //     current: getPrecipitation(forecast),
  //     weight: 1,
  //     mapping: Niederschlag
  //   }
  // };

  // return kategories;
}

// public async chooseBestMatch(){

//     const list = fs.readdirSync("../smart-ambiente-media/img/wetter");

//     const files = shuffle(list)
//       .map(i => {
//         return {
//           file: i,
//           kategories: i
//             .replace(/ \([0-9]+\)/g, "")
//             .replace(/\.[a-z0-9]+/g, "")
//             .split(" ")
//             .map(k => {
//               return {
//                 key: k.split("=")[0],
//                 value: k
//                   .split("=")[1]
//                   .split(",")
//                   .map(
//                     v =>
//                       (kategories[k.split("=")[0]].mapping[
//                         v as any
//                       ] as any) as number
//                   )
//               };
//             })
//         };
//       })
//       .map(f => {
//         return {
//           file: f.file,
//           accuracy: f.kategories
//             .map(k => {
//               const kategorie = kategories[k.key];
//               const minAbstand = Math.min(
//                 ...k.value.map(v => Math.abs(v - kategorie.current))
//               );
//               return (
//                 (1 - minAbstand / kategorie.maxDeviation) * kategorie.weight
//               );
//             })
//             .reduce((a, b) => a + b, 0)
//         };
//       })
//       .sort((a, b) => b.accuracy - a.accuracy);

//     const rangedFiles: { file: string; max: number }[] = [];

//     let max = 0;
//     for (const f of files.filter(f => f.accuracy > 0)) {
//       max += f.accuracy;
//       rangedFiles.push({ file: f.file, max: max });
//     }

//     const next = random(0, max);
//     const file = rangedFiles.filter(f => f.max >= next)[0].file;

//     return file;
//   }
