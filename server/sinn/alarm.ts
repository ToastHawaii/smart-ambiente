import { sequenz } from "../utils/timer";
import * as Hue from "../os/philips-hue-api";
import * as WeatherForecast from "../kanal/Weather/Forecast";
import { setKanal, setSinn, getKanal, getSinn } from "../server";
import { loadConfig } from "../utils/config";

const hue = Hue.createHueService(
  "http://192.168.1.101/api/p5u0Ki9EwbUQ330gcMA9-gK3qBKhYWCWJ1NmkNVs"
);

const interval = 6;
const transition = interval * 60 * 10;

(async function () {
  const config = await loadConfig();

  if (config.aufwachen.aktiv !== "an") return;

  let tonActiv = true;
  let lichtActiv = true;

  function check() {
    if (getSinn("ton").lautstaerke === "aus" ||
      (getSinn("ton").kanal !== "wetter" && getSinn("ton").kanal !== "nachrichten"))
      tonActiv = false;

    if (getSinn("licht").helligkeit === "aus" || getSinn("licht").kanal !== "sonnenaufgang")
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

      setSinn("licht", { helligkeit: "überall", kanal: "sonnenaufgang" }, "alarm");

      if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
        hue.recallScene("Wohnzimmer", "Minimum", 1);
        hue.recallScenes(["Terrasse", "Toilette"], "Nachtlicht", 1);
      } else {
        hue.recallScenes(["Wohnzimmer", "Terrasse", "Toilette"], "Minimum (Heiter)", 1);
      }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "2", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang (1)", transition);
          hue.recallScenes(["Terrasse", "Toilette"], "Nachtlicht", transition);
        } else {
          hue.recallScenes(["Wohnzimmer", "Terrasse"], "Sonnenaufgang 1 (Heiter)", transition);
          hue.recallScene("Toilette", "Minimum (Heiter)", transition);
        }
    },
    async () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "4", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(["Wohnzimmer", "Terrasse"], "Sonnenaufgang (2)", transition);
          hue.recallScene("Toilette", "Nachtlicht", transition);

          hue.recallScene("Schlafzimmer", "Minimum", 1);
        } else {
          hue.recallScenes(["Wohnzimmer", "Terrasse"], "Sonnenaufgang 2 (Heiter)", transition);
          hue.recallScene("Toilette", "Minimum (Heiter)", transition);

          hue.recallScene("Schlafzimmer", "Minimum (Heiter)", 1);
        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "6", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(["Wohnzimmer", "Terrasse"], "Sonnenaufgang (3)", transition);
          hue.recallScene("Toilette", "Gedimmt", transition);
          hue.recallScene("Schlafzimmer", "Nachtlicht", transition);
        } else {
          hue.recallScenes(["Wohnzimmer",
            "Terrasse",
            "Toilette",
            "Schlafzimmer"], "Sonnenaufgang 3 (Heiter)", transition);

        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "8", kanal: "wetter" }, "alarm");

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScenes(["Wohnzimmer", "Terrasse"], "Sonnenaufgang (4)", transition);
          hue.recallScenes(["Toilette", "Schlafzimmer"], "Entspannen", transition);
        } else {
          hue.recallScenes(["Wohnzimmer",
            "Terrasse",
            "Toilette",
            "Schlafzimmer"], "Sonnenaufgang 4 (Heiter)", transition);
        }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.3 }, "alarm");
        setSinn("ton", { lautstaerke: "10", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        hue.recallScenes(["Wohnzimmer", "Terrasse", "Toilette", "Schlafzimmer"], "Konzentration", transition);

      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.6 }, "alarm");
        setSinn("ton", { lautstaerke: "12", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        hue.recallScenes(["Wohnzimmer", "Terrasse", "Toilette", "Schlafzimmer"], "Aktivieren", transition);
      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 1 }, "alarm");
        setSinn("ton", { lautstaerke: "14", kanal: "wetter" }, "alarm");
      }

      if (lichtActiv) {
        setSinn("licht", { helligkeit: "viel", kanal: "tageslicht" }, "alarm");
      }
    },
    () => {
      check();

      if (tonActiv) {
        setSinn("ton", { lautstaerke: "15", kanal: "nachrichten" }, "alarm");
        setSinn("bild", { bildschirm: "ein", kanal: "ansehen" }, "alarm");
      }
    }
  ]);
})();
