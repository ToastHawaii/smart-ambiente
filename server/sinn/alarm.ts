import { sequenz, delay } from "../utils/timer";
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
    if (getSinn("ton").lautstaerke === "aus")
      tonActiv = false;

    if (getSinn("licht").helligkeit === "aus")
      lichtActiv = false;
  }

  const zeit = config.alarm.zeit;
  const days = config.alarm.tage;
  sequenz(zeit, days, interval, [
    async () => {
      const weather = await WeatherForecast.query();

      setSinn("ton", { lautstaerke: "aus", kanal: "wetter" });
      setKanal("wetter", { ...weather, mode: "manuell" });

      setSinn("licht", { helligkeit: "aus", kanal: "tageslicht" });
    },
    async () => {
      setSinn("ton", { lautstaerke: "1", kanal: "wetter" });

      setSinn("licht", { helligkeit: "viel", kanal: "tageslicht" });

      await delay(3 * 1000);

      if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
        await hue.recallScene("Wohnzimmer", "Minimum", 1);
        hue.recallScene("Wohnzimmer", "Minimum", 1);

        await hue.recallScene("Terrasse", "Nachtlicht", 1);
        hue.recallScene("Terrasse", "Nachtlicht", 1);

        await hue.recallScene("Toilette", "Nachtlicht", 1);
        hue.recallScene("Toilette", "Nachtlicht", 1);
      } else {
        await hue.recallScene("Wohnzimmer", "Minimum (Heiter)", 1);
        hue.recallScene("Wohnzimmer", "Minimum (Heiter)", 1);

        await hue.recallScene("Terrasse", "Minimum (Heiter)", 1);
        hue.recallScene("Terrasse", "Minimum (Heiter)", 1);

        await hue.recallScene("Toilette", "Minimum (Heiter)", 1);
        hue.recallScene("Toilette", "Minimum (Heiter)", 1);
      }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "2", kanal: "wetter" });

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang (1)", transition);
          hue.recallScene("Terrasse", "Nachtlicht", transition);
          hue.recallScene("Toilette", "Nachtlicht", transition);
        } else {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang 1 (Heiter)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang 1. (Heiter)", transition);
          hue.recallScene("Toilette", "Minimum (Heiter)", transition);
        }
    },
    async () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "4", kanal: "wetter" });

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang (2)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang (2)", transition);
          hue.recallScene("Toilette", "Nachtlicht", transition);

          await hue.recallScene("Schlafzimmer", "Minimum", 1);
          hue.recallScene("Schlafzimmer", "Minimum", 1);
        } else {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang 2 (Heiter)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang 2. (Heiter)", transition);
          hue.recallScene("Toilette", "Minimum (Heiter)", transition);

          await hue.recallScene("Schlafzimmer", "Minimum (Heiter)", 1);
          hue.recallScene("Schlafzimmer", "Minimum (Heiter)", 1);
        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "6", kanal: "wetter" });

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang (3)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang (3)", transition);
          hue.recallScene("Toilette", "Gedimmt", transition);
          hue.recallScene("Schlafzimmer", "Nachtlicht", transition);
        } else {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang 3 (Heiter)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang 3. (Heiter)", transition);
          hue.recallScene("Toilette", "Sonnenaufgang 3. (Heiter)", transition);
          hue.recallScene(
            "Schlafzimmer",
            "Sonnenaufgang 3. (Heiter)",
            transition
          );
        }
    },
    () => {
      check();

      if (tonActiv)
        setSinn("ton", { lautstaerke: "8", kanal: "wetter" });

      if (lichtActiv)
        if ((getKanal("wetter") as WeatherForecast.Forecast).wolken > 0.2) {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang (4)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang (4)", transition);
          hue.recallScene("Toilette", "Entspannen", transition);
          hue.recallScene("Schlafzimmer", "Entspannen", transition);
        } else {
          hue.recallScene("Wohnzimmer", "Sonnenaufgang 4 (Heiter)", transition);
          hue.recallScene("Terrasse", "Sonnenaufgang 4. (Heiter)", transition);
          hue.recallScene("Toilette", "Sonnenaufgang 4. (Heiter)", transition);
          hue.recallScene(
            "Schlafzimmer",
            "Sonnenaufgang 4. (Heiter)",
            transition
          );
        }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.3 });
        setSinn("ton", { lautstaerke: "10", kanal: "wetter" });
      }

      if (lichtActiv) {
        hue.recallScene("Wohnzimmer", "Konzentration", transition);
        hue.recallScene("Terrasse", "Konzentration", transition);
        hue.recallScene("Toilette", "Konzentration", transition);
        hue.recallScene("Schlafzimmer", "Konzentration", transition);
      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 0.6 });
        setSinn("ton", { lautstaerke: "12", kanal: "wetter" });
      }

      if (lichtActiv) {
        hue.recallScene("Wohnzimmer", "Aktivieren", transition);
        hue.recallScene("Terrasse", "Aktivieren", transition);
        hue.recallScene("Toilette", "Aktivieren", transition);
        hue.recallScene("Schlafzimmer", "Aktivieren", transition);
      }
    },
    () => {
      check();

      if (tonActiv) {
        setKanal("wetter", { ...getKanal("wetter"), radio: 1 });
        setSinn("ton", { lautstaerke: "14", kanal: "wetter" });
      }
    },
    () => {
      check();

      if (tonActiv){
        setSinn("ton", { lautstaerke: "15", kanal: "nachrichten" });
        
      setSinn("bild", { bildschirm: "ein", kanal: "ansehen" });}
    }
  ]);
})();
