import * as Owm from "./openweathermap";

function hasPrecipitation(forecast: Owm.Forecast) {
  for (const s of forecast.list) {
    if ((s.rain && s.rain["3h"] >= 0.3) || (s.snow && s.snow["3h"] >= 0.3)) {
      return true;
    }
  }
  return false;
}

function hasWind(forecast: Owm.Forecast) {
  for (const s of forecast.list) {
    if (s.wind && s.wind.speed >= 5 /* 5 m/s = 18 km/h */) {
      return true;
    }
  }
  return false;
}

function hasClouds(forecast: Owm.Forecast) {
  for (const s of forecast.list) {
    if (s.clouds && s.clouds.all >= 20 /* 20% */) {
      return true;
    }
  }
  return false;
}

function hasFog(forecast: Owm.Forecast) {
  for (let s of forecast.list) {
    for (let w of s.weather) {
      if (
        w.id === 701 ||
        w.id === 711 ||
        w.id === 721 ||
        w.id === 731 ||
        w.id === 741 ||
        w.id === 751 ||
        w.id === 761
      ) {
        return true;
      }
    }
  }
  return false;
}

function getTemp(forecast: Owm.Forecast) {
  let temp = 0;
  let i = 0;
  for (let s of forecast.list) {
    temp += s.main.temp;
    i++;
  }
  temp = temp / i;

  if (temp < 4) return "eisig";

  if (temp < 12) return "kalt";

  if (temp < 18) return "mild";

  if (temp < 22) return "warm";

  return "heiss";
}

function isSevere(forecast: Owm.Forecast) {
  for (const s of forecast.list) {
    if (s.wind && s.wind.speed >= 16 /* 16 m/s = 58 km/h */) {
      return true;
    }
  }

  for (let s of forecast.list) {
    for (let w of s.weather) {
      if (
        (w.id + "").charAt(0) === "2" ||
        w.id === 771 ||
        w.id === 781 ||
        w.id === 900 ||
        w.id === 901 ||
        w.id === 902 ||
        w.id === 905 ||
        w.id === 906 ||
        w.id === 956 ||
        w.id === 957 ||
        w.id === 958 ||
        w.id === 959 ||
        w.id === 960 ||
        w.id === 961 ||
        w.id === 962
      ) {
        return true;
      }
    }
  }

  for (const s of forecast.list) {
    if ((s.rain && s.rain["3h"] > 30) || (s.snow && s.snow["3h"] > 30)) {
      return true;
    }
  }

  return false;
}

export function createSimpleWeatherService() {
  return new SimpleWeather();
}

export interface Forecast {
  wolken: boolean;
  wind: boolean;
  niederschlag: boolean;
  temperatur: "eisig" | "kalt" | "mild" | "warm" | "heiss";
  gewitter: boolean;
  nebel: boolean;
}

class SimpleWeather {
  public query(callback: (result: Forecast) => void) {
    Owm.createOwmService("1b7711f9c2aeb2429128f1b33f63219c").queryForecast(
      forecast => {
        forecast = forecast || ({} as any);
        forecast.list = forecast.list || ([] as any);

        callback({
          niederschlag: hasPrecipitation(forecast),
          wind: hasWind(forecast),
          wolken: hasClouds(forecast),
          temperatur: getTemp(forecast),
          gewitter: isSevere(forecast),
          nebel: hasFog(forecast)
        });
      }
    );
  }
}
