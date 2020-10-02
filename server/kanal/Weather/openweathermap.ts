// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

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
