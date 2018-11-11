import * as SonosHttp from "../node-sonos-http-api";
import { Forecast } from "./Forecast";

export async function playSound(weather: Forecast) {
  let searchTerm = "Wetter - ";

  switch (weather.temperatur) {
    case 0:
      searchTerm += "Eisig";
      break;
    case 1:
      searchTerm += "Kalt";
      break;
    case 2:
      searchTerm += "Mild";
      break;
    case 3:
      searchTerm += "Warm";
      break;
    case 4:
      searchTerm += "Heiss";
      break;
  }

  if (weather.niederschlag >= 1) {
    searchTerm += ", Niederschlag";
  } else if (weather.wind >= 1) {
    searchTerm += ", Wind";
  }

  await SonosHttp.createClient()
    .room("wohnzimmer")
    .groupMute()
    .pause()
    .shuffle("on")
    .playlist(searchTerm)
    .groupUnmute()
    .crossfade("on")
    .repeat("on")
    .do();
}

export function getImage() {}
