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

import { relative } from "../utils/math";
import { delay } from "../utils/timer";
import * as Hue from "./philips-hue-api";
import * as SonosHttp from "./node-sonos-http-api";
import { scenes } from "../scenes";

const hue = Hue.createHueService(
  "http://192.168.178.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs",
  scenes
);

const sonosHttp = SonosHttp.createClient();

let gangOn: boolean | undefined = undefined;
let badOn: boolean | undefined = undefined;

async function gangCheck() {
  let lightResult = await hue.getLightByName("Deckenlampe");
  lightResult = lightResult || ({} as any);
  lightResult.state = lightResult.state || ({} as any);

  if (lightResult.state.on === undefined) return;

  if (lightResult.state.on) {
    if (!gangOn || gangOn === undefined) {
      // console.log("Gang an");

      const state = await sonosHttp.room("Wohnzimmer").state();
      await sonosHttp
        .room("Küche")
        .volume(relative(state.volume, 20, 15))
        .join("Wohnzimmer")
        .do();
    }
  } else {
    if (gangOn || gangOn === undefined) {
      // console.log("Gang aus");
      await sonosHttp.room("Küche").leave("Wohnzimmer").do();
    }
  }
  gangOn = lightResult.state.on;
}

async function badCheck() {
  let lightResult = await hue.getLightByName("Schrank");
  lightResult = lightResult || ({} as any);
  lightResult.state = lightResult.state || ({} as any);

  if (lightResult.state.on === undefined) return;

  let sensorResult = await hue.getSensors("6");
  sensorResult = sensorResult || ({} as any);
  sensorResult.state = sensorResult.state || ({} as any);

  if (sensorResult.state.presence === undefined) return;

  if (lightResult.state.on || sensorResult.state.presence) {
    if (!badOn || badOn === undefined) {
      // console.log("Bad an");

      const state = await sonosHttp.room("Wohnzimmer").state();
      await sonosHttp
        .room("Bad")
        .volume(relative(state.volume, 20, 100))
        .join("Wohnzimmer")
        .do();
    }
  } else {
    if (badOn || badOn === undefined) {
      // console.log("Bad aus");
      await sonosHttp.room("Bad").leave("Wohnzimmer").do();
    }
  }
  badOn = lightResult.state.on;
}

async function roomCheck() {
  gangCheck();
  badCheck();

  await delay(3000);
  roomCheck();
}
roomCheck();
