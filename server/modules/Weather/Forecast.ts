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

  if (temp < 26) return Temperatur.Heiss;

  return Temperatur.SehrHeiss;
}

export function getTempFolder(temperatur: number) {
  switch (temperatur) {
    case 0:
      return "icy";

    case 1:
      return "cold";

    case 2:
      return "mild";

    case 3:
      return "warm";

    case 4:
      return "hot";

    case 5:
      return "very-hot";
  }
  throw "temperatur not known";
}

export enum Temperatur {
  Eisig,
  Kalt,
  Mild,
  Warm,
  Heiss,
  SehrHeiss
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
