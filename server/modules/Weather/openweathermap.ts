import { getJson } from "../../utils/request";

export function createOwmService(appId: string) {
  return new Owm(appId);
}

export interface Forecast {
  cod: string;
  message: number;
  cnt: number;
  list: [
    {
      dt: number;
      main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
      };
      weather: [
        { id: number; main: string; description: string; icon: string }
      ];
      clouds: { all: number };
      wind: { speed: number; deg: number };
      sys: { pod: string };
      dt_txt: string;
      rain?: { "3h": number };
      snow?: { "3h": number };
    }
  ];
}

class Owm {
  public constructor(private appId: string) {}

  public async queryForecast() {
    return await getJson<Forecast>(
      "http://api.openweathermap.org/data/2.5/forecast?q=Zurich,CH&units=metric&lang=de&APPID=" +
        this.appId +
        "&cnt=5"
    );
  }
}
