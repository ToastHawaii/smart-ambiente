import * as Hue from "./philips-hue-api";
import * as SimpleWeather from "./SimpleWeather";
import * as SonosHttp from "./node-sonos-http-api";
import * as cron from "node-cron";
import { toArray } from "../utils";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);
const sonosHttp = SonosHttp.createSonosService("http://localhost:5005");

if (args["--MODE RELEASE"])
  SimpleWeather.createSimpleWeatherService().query(weather => {
    if (!args["--WAKEUPROUTINE OFF"]) {
      setTon(weather);
      setLicht(weather);
    } else {
      disableLicht();
    }
  });

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
    .shuffle("on")
    .playlist(searchTerm)
    .pause()
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .do();
}

cron
  .schedule("0 8 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(1)
      .play()
      .do();
  })
  .start();
cron
  .schedule("0 13 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(2)
      .do();
  })
  .start();
cron
  .schedule("0 18 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(4)
      .do();
  })
  .start();
cron
  .schedule("0 23 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(8)
      .do();
  })
  .start();
cron
  .schedule("0 28 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(10)
      .favorite("SRF 4 News (Nachrichten)")
      .play()
      .do();
  })
  .start();
cron
  .schedule("0 33 7 * * 1-5", function() {
    sonosHttp
      .room("wohnzimmer")
      .volume(15)
      .do();
  })
  .start();
