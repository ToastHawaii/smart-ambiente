import * as Hue from "./philips-hue-api";
import * as WeatherForecast from "./Weather/Forecast";
import * as cron from "node-cron";
import { toArray } from "../utils";
import * as moment from "moment";
import { setKanal, setSinn } from "../server";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

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
      setSinn("licht", { helligkeit: "aus", kanal: "tageslicht" });
      const weather = await WeatherForecast.query();
      setLicht(weather);

      setSinn("ton", { lautstaerke: "aus", kanal: "wetter" });
      setKanal("wetter", { mode: "vorhersage" });
    },
    () => {
      setSinn("licht", { helligkeit: "viel", kanal: "tageslicht" });
      setSinn("ton", { lautstaerke: "1", kanal: "wetter" });
    },
    () => {
      setSinn("ton", { lautstaerke: "2", kanal: "wetter" });
    },
    () => {
      setSinn("ton", { lautstaerke: "4", kanal: "wetter" });
    },
    () => {
      setSinn("ton", { lautstaerke: "8", kanal: "wetter" });
    },
    () => {
      setSinn("ton", { lautstaerke: "10", kanal: "nachrichten" });
    },
    () => {
      setSinn("ton", { lautstaerke: "13", kanal: "nachrichten" });
    }
  ]);
} else {
  disableLicht();
}
