import * as Hue from "./philips-hue-api";
import * as WeatherForecast from "./Weather/Forecast";
import * as SonosHttp from "./node-sonos-http-api";
import * as cron from "node-cron";
import { toArray, calcRelativeValue } from "../utils";
import * as moment from "moment";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);
const sonosHttp = SonosHttp.createClient();

async function setLicht(weather: WeatherForecast.Forecast) {
  const result = await hue.querySchedules();
  const schedules = toArray<
    {
      [index: string]: Hue.Scheduler;
    },
    Hue.Scheduler
  >(result);
  if (weather.wolken >= 1) {
    // console.log("Bewölkt");
    for (const s of schedules.filter(
      s => s.name.indexOf("Sonnenaufgang") !== -1
    )) {
      // console.log(s.name + " Ein");
      hue.updateSchedulesEnabled(s.id);
    }
    for (const s of schedules.filter(s => s.name.indexOf("Heiter") !== -1)) {
      // console.log(s.name + " Aus");
      hue.updateSchedulesDisabled(s.id);
    }
  } else {
    // console.log("Heiter");
    for (const s of schedules.filter(
      s => s.name.indexOf("Sonnenaufgang") !== -1
    )) {
      // console.log(s.name + " Aus");
      hue.updateSchedulesDisabled(s.id);
    }
    for (const s of schedules.filter(s => s.name.indexOf("Heiter") !== -1)) {
      // console.log(s.name + " Ein");
      hue.updateSchedulesEnabled(s.id);
    }
  }
}

async function disableLicht() {
  const result = await hue.querySchedules();
  const schedules = toArray<
    {
      [index: string]: Hue.Scheduler;
    },
    Hue.Scheduler
  >(result);
  for (const s of schedules.filter(
    s =>
      s.name.indexOf("Heiter") !== -1 ||
      s.name.indexOf("Sonnenaufgang") !== -1 ||
      s.name.indexOf("Morgen") !== -1 ||
      s.name.indexOf("Ausschalten") !== -1
  )) {
    // console.log(s.name + " Aus");
    hue.updateSchedulesDisabled(s.id);
  }
}

function setTon(weather: WeatherForecast.Forecast) {
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

  console.log(searchTerm);

  sonosHttp
    .room("wohnzimmer")
    .groupMute()
    .pause()
    .shuffle("on")
    .playlist(searchTerm)
    .pause()
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .do();
}

function setLautstaerke(volume: number) {
  sonosHttp
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  sonosHttp
    .room("Bad")
    .volume(calcRelativeValue(volume, 25, 15))
    .do();
  sonosHttp
    .room("Schlafzimmer")
    .volume(calcRelativeValue(volume, 25, 80))
    .do();
}

function sequenz(
  start: moment.Duration,
  days: string,
  pauseInMinutes: number,
  functions: (() => void)[]
) {
  let next = start;
  for (const fn of functions) {
    cron
      .schedule(`0 ${next.minutes()} ${next.hours()} * * ${days}`, fn)
      .start();
    next = next.add(pauseInMinutes, "minutes");
  }
}

if (!args["--NOALARM"]) {
  sequenz(moment.duration("07:03"), "1-5", 5, [
    async () => {
      const weather = await WeatherForecast.query();
      setTon(weather);
      setLicht(weather);
    },
    () => {
      setLautstaerke(1);
      sonosHttp
        .room("wohnzimmer")
        .play()
        .do();
    },
    () => {
      setLautstaerke(2);
    },
    () => {
      setLautstaerke(4);
    },
    () => {
      setLautstaerke(8);
    },
    () => {
      setLautstaerke(10);
      sonosHttp
        .room("wohnzimmer")
        .favorite("SRF 4 News (Nachrichten)")
        .play()
        .do();
    },
    () => {
      setLautstaerke(13);
    }
  ]);
} else {
  disableLicht();
}
