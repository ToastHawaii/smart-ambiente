import * as Hue from "./philips-hue-api";
import * as SimpleWeather from "./SimpleWeather";
import * as SonosHttp from "./node-sonos-http-api";
import * as cron from "node-cron";
import { toArray } from "../utils";
import moment = require("moment");

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);
const sonosHttp = SonosHttp.createSonosService("http://localhost:5005");

function setLicht(weather: SimpleWeather.Forecast) {
  hue.querySchedules(result => {
    const schedules = toArray<
      {
        [index: string]: Hue.Scheduler;
      },
      Hue.Scheduler
    >(result);
    if (weather.wolken) {
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
  });
}

function disableLicht() {
  hue.querySchedules(result => {
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
  });
}

function setTon(weather: SimpleWeather.Forecast) {
  let searchTerm = "Wetter - ";

  if (weather.gewitter) {
    searchTerm += "Unwetter";
  } else if (weather.nebel) {
    searchTerm += "Nebel";
  } else {
    switch (weather.temperatur) {
      case "eisig":
        searchTerm += "Eisig";
        break;
      case "kalt":
        searchTerm += "Kalt";
        break;
      case "mild":
        searchTerm += "Mild";
        break;
      case "warm":
        searchTerm += "Warm";
        break;
      case "heiss":
        searchTerm += "Heiss";
        break;
    }

    if (weather.niederschlag) {
      searchTerm += ", Niederschlag";
    } else if (weather.wind) {
      searchTerm += ", Wind";
    }
  }

  console.log(searchTerm);

  sonosHttp
    .room("wohnzimmer")
    .groupMute()
    .pause()
    .playlist(searchTerm)
    .pause()
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .shuffle("on")
    .do();
}

function setLautstaerke(volume: number) {
  sonosHttp
    .room("Wohnzimmer")
    .volume(volume)
    .do();
  sonosHttp
    .room("Bad")
    .volume(calcRelativeVolume(volume, 25, 15))
    .do();
  sonosHttp
    .room("Schlafzimmer")
    .volume(calcRelativeVolume(volume, 25, 80))
    .do();
}

function calcRelativeVolume(
  value: number,
  refRoomVolume: number,
  roomVolume: number
) {
  if (value >= refRoomVolume)
    return Math.round(
      (100 - roomVolume) *
        (1 / (100 - refRoomVolume)) *
        (value - refRoomVolume) +
        roomVolume
    );
  else
    return Math.round(
      roomVolume * (1 / refRoomVolume) * (value - refRoomVolume) + roomVolume
    );
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
    () => {
      SimpleWeather.createSimpleWeatherService().query(weather => {
        setTon(weather);
        setLicht(weather);
      });
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
