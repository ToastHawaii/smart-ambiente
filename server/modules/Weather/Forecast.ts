import * as Owm from "./openweathermap";
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
  return Math.min(
    1,
    midrange(
      ...forecast.list.map(
        s =>
          (1 / 0.6) *
          ((s.rain && s.rain["3h"]) || (s.snow && s.snow["3h"]) || 0)
      )
    )
  );
}

function getWind(forecast: Owm.Forecast) {
  return Math.min(
    1,
    midrange(
      ...forecast.list.map(s => (1 / 10) /* 10 m/s = 36 km/h */ * s.wind.speed)
    )
  );
}

function getCloudiness(forecast: Owm.Forecast) {
  return midrange(...forecast.list.map(s => s.clouds.all)) / 100;
}

function getTemp(forecast: Owm.Forecast): number {
  const temp = midrange(...forecast.list.map(s => s.main.temp));

  if (temp < 0) return Temperatur.MaessigKalt;

  if (temp < 5) return Temperatur.Kuehl;

  if (temp < 10) return Temperatur.Mild;

  if (temp < 15) return Temperatur.MaessigWarm;

  if (temp < 20) return Temperatur.Warm;

  if (temp < 25) return Temperatur.SehrWarm;

  return Temperatur.Heiss;
}

export function getTempFolder(temperatur: number) {
  switch (temperatur) {
    case 0:
      return "moderately-cold";

    case 1:
      return "cool";

    case 2:
      return "mild";

    case 3:
      return "moderately-warm";

    case 4:
      return "warm";

    case 5:
      return "very-warm";

    case 6:
      return "hot";
  }
  throw "temperatur not known";
}

export enum Temperatur {
  MaessigKalt,
  Kuehl,
  Mild,
  MaessigWarm,
  Warm,
  SehrWarm,
  Heiss
}

export enum Zeit {
  Nacht,
  Daemmerung,
  Tag
}

export enum Wolken {
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
}
