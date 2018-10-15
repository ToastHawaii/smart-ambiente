import * as Hue from "./philips-hue-api";
import * as SimpleWeather from "./SimpleWeather";
import * as SonosHttp from "./node-sonos-http-api";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

SimpleWeather.createSimpleWeatherService().query(weather => {
  checkWeather(weather);

  if (!args["--WAKEUPROUTINE OFF"]) {
    hue.querySchedules(result => {
      const schedules = toArray<
        { [index: string]: Hue.Scheduler },
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

        for (const s of schedules.filter(
          s => s.name.indexOf("Heiter") !== -1
        )) {
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

        for (const s of schedules.filter(
          s => s.name.indexOf("Heiter") !== -1
        )) {
          // console.log(s.name + " Ein");
          hue.updateSchedulesEnabled(s.id);
        }
      }
    });
  } else {
    hue.querySchedules(result => {
      const schedules = toArray<
        { [index: string]: Hue.Scheduler },
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
});

function toArray<O extends { [index: string]: T }, T>(o: O) {
  const a: (T & { id: string })[] = [];
  for (const p in o) {
    const i = o[p] as T & { id: string };
    i.id = p;
    a.push(i);
  }
  return a;
}

const sonosHttp = SonosHttp.createSonosService("http://localhost:5005");

function checkWeather(weather: SimpleWeather.Forecast, callback?: () => void) {
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
    .do(callback);

  return searchTerm;
}
