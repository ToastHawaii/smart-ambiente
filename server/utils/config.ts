import * as fs from "fs";

export interface Config {
  [prop: string]: any;
  erde: {
    key: string;
  };
  flug: {
    key: string;
  };
  aufwachen: {
    aktiv: "aus" | "an";
    kanal: "alarm";
  };
  alarm: {
    aktiv: boolean;
    zeit: "05:56" | "06:56" | "07:56";
    tage: "1-5" | "0-6";
  };
}

const config = "../../smart-ambiente-media/config.json";

export function saveConfig(data: Partial<Config>) {
  return new Promise<void>(async (resolve, reject) => {
    fs.writeFile(
      config,
      JSON.stringify({ ...(await loadConfig()), ...data }),
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export function loadConfig() {
  return new Promise<Config>((resolve, reject) => {
    fs.readFile(config, "utf8", function(err, data) {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}
