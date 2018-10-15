import * as Hue from "./philips-hue-api";
import * as SonosHttp from "./node-sonos-http-api";

const args: { [arg: string]: boolean } = {};
for (const arg of process.argv.slice(2)) {
  args[arg.toUpperCase()] = true;
}

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

const sonosHttp = SonosHttp.createSonosService("http://localhost:5005");

let schlafzimmerOn: boolean | undefined = undefined;
let badOn: boolean | undefined = undefined;
function roomCheck() {
  // Schlafzimmer
  hue.getLights("9", result => {
    result = result || ({} as any);
    result.state = result.state || ({} as any);

    if (result.state.on === undefined) return;

    if (result.state.on) {
      if (!schlafzimmerOn || schlafzimmerOn === undefined) {
        // console.log("Schlafzimmer an");

        sonosHttp.room("Wohnzimmer").state(state => {
          sonosHttp
            .room("Schlafzimmer")
            .volume(calcRelativeVolume(state.volume, 25, 70))
            .join("Wohnzimmer")
            .do();
        });
      }
    } else {
      if (schlafzimmerOn || schlafzimmerOn === undefined) {
        // console.log("Schlafzimmer aus");
        sonosHttp
          .room("Schlafzimmer")
          .leave("Wohnzimmer")
          .do();
      }
    }
    schlafzimmerOn = result.state.on;
  });

  hue.getLights("4", result => {
    result = result || ({} as any);
    result.state = result.state || ({} as any);

    if (result.state.on === undefined) return;

    if (result.state.on) {
      if (!badOn || badOn === undefined) {
        // console.log("Bad an");

        sonosHttp.room("Wohnzimmer").state(state => {
          sonosHttp
            .room("Bad")
            .volume(calcRelativeVolume(state.volume, 25, 15))
            .join("Wohnzimmer")
            .do();
        });
      }
    } else {
      if (badOn || badOn === undefined) {
        // console.log("Bad aus");
        sonosHttp
          .room("Bad")
          .leave("Wohnzimmer")
          .do();
      }
    }
    badOn = result.state.on;
  });

  setTimeout(() => {
    roomCheck();
  }, 3000);
}
roomCheck();

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
