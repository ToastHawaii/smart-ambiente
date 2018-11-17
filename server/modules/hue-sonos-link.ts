import { relative } from "../utils/math";
import { delay } from "../utils/timer";
import * as Hue from "./philips-hue-api";
import * as SonosHttp from "./node-sonos-http-api";

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

const sonosHttp = SonosHttp.createClient();

let schlafzimmerOn: boolean | undefined = undefined;
let badOn: boolean | undefined = undefined;

async function schlafzimmerCheck() {
  let result = await hue.getLights("9");
  result = result || ({} as any);
  result.state = result.state || ({} as any);

  if (result.state.on === undefined) return;

  if (result.state.on) {
    if (!schlafzimmerOn || schlafzimmerOn === undefined) {
      // console.log("Schlafzimmer an");

      const state = await sonosHttp.room("Wohnzimmer").state();
      await sonosHttp
        .room("Schlafzimmer")
        .volume(relative(state.volume, 25, 80))
        .join("Wohnzimmer")
        .do();
    }
  } else {
    if (schlafzimmerOn || schlafzimmerOn === undefined) {
      // console.log("Schlafzimmer aus");
      await sonosHttp
        .room("Schlafzimmer")
        .leave("Wohnzimmer")
        .do();
    }
  }
  schlafzimmerOn = result.state.on;
}

async function badCheck() {
  let result = await hue.getLights("4");
  result = result || ({} as any);
  result.state = result.state || ({} as any);

  if (result.state.on === undefined) return;

  if (result.state.on) {
    if (!badOn || badOn === undefined) {
      // console.log("Bad an");

      const state = await sonosHttp.room("Wohnzimmer").state();
      await sonosHttp
        .room("Bad")
        .volume(relative(state.volume, 25, 15))
        .join("Wohnzimmer")
        .do();
    }
  } else {
    if (badOn || badOn === undefined) {
      // console.log("Bad aus");
      await sonosHttp
        .room("Bad")
        .leave("Wohnzimmer")
        .do();
    }
  }
  badOn = result.state.on;
}

async function roomCheck() {
  schlafzimmerCheck();
  badCheck();

  await delay(3000);
  roomCheck();
}
roomCheck();
