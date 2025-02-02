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

import { sequenz } from "../utils/timer";
import * as Hue from "../os/philips-hue-api";
import * as WeatherForecast from "../kanal/Weather/Forecast";
import { setKanal, setSinn, getKanal, getSinn } from "../server";
import { loadConfig } from "../utils/config";
import { scenes } from "../scenes";

const hue = Hue.createHueService(
  "http://192.168.178.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs",
  scenes
);

const interval = 4; // min
const transition = interval * 60 * 10;

(async function () {
  const config = await loadConfig();

  if (config.aufwachen.aktiv !== "an") return;

  let tonActiv = true;
  let lichtActiv = true;

  function check() {
    if (
      getSinn("ton").lautstaerke === "aus" ||
      (getSinn("ton").kanal !== "wetter" &&
        getSinn("ton").kanal !== "nachrichten")
    )
      tonActiv = false;

    if (
      getSinn("licht").helligkeit === "aus" ||
      getSinn("licht").kanal !== "szene" ||
      getKanal("szene").szene !== "sonnenaufgang"
    )
      lichtActiv = false;
  }

  const zeit = config.alarm.zeit;
  const days = config.alarm.tage;
  sequenz(zeit, days, interval, [
    async () => {
      const weather = await WeatherForecast.query();

      setSinn("ton", { lautstaerke: "aus", kanal: "wetter" }, "alarm");
      setKanal("wetter", { ...weather, mode: "manuell" }, "alarm");

      setKanal("szene", { szene: "sonnenaufgang" }, "alarm");
      setSinn("licht", { helligkeit: "aus", kanal: "szene" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "1", kanal: "wetter" }, "alarm");

      setSinn("licht", { helligkeit: "wenig", kanal: "szene" }, "alarm");

      if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
        hue.recallScenes(["Boden"], "Nachtlicht", 1);
      } else {
        hue.recallScenes(["Boden"], "Minimum (Heiter)", 1);
      }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "2", kanal: "wetter" }, "alarm");

      if (lichtActiv) {
        setSinn("licht", { helligkeit: "viel", kanal: "szene" }, "alarm");

        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Schlafzimmer", "Sonnenaufgang (1)", 1);
          hue.recallScenes(["Boden"], "Nachtlicht", transition);
        } else {
          hue.recallScene("Schlafzimmer", "Sonnenaufgang 1 (Heiter)", 1);
          hue.recallScene("Boden", "Sonnenaufgang 1 (Heiter)", transition);
        }
      }
    },
    async () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "3", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang (2)",
            transition
          );
        } else {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang 2 (Heiter)",
            transition
          );
        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "4", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang (3)",
            transition
          );
        } else {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang 3 (Heiter)",
            transition
          );
        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "5", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang (4)",
            transition
          );
        } else {
          hue.recallScenes(
            ["Schlafzimmer", "Boden"],
            "Sonnenaufgang 4 (Heiter)",
            transition
          );
        }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.3 }, "alarm");
        setSinn("ton", { lautstaerke: "6", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        hue.recallScenes(
          ["Schlafzimmer", "Boden"],
          "Konzentration",
          transition
        );
      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.6 }, "alarm");
        setSinn("ton", { lautstaerke: "7", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        hue.recallScenes(
          ["Schlafzimmer", "Boden"],
          "Aktivieren",
          transition
        );
      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 1 }, "alarm");
        setSinn("ton", { lautstaerke: "8", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        setSinn("licht", { helligkeit: "viel", kanal: "tageslicht" }, "alarm");
      }
    },
    () => {
      check();

      if (tonActiv) {
        setSinn("ton", { lautstaerke: "9", kanal: "nachrichten" }, "alarm");
        setSinn("bild", { bildschirm: "ein", kanal: "ansehen" }, "alarm");
      }
    },
  ]);
})();
