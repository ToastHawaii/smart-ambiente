import * as fs from "fs";

export interface Config {
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

const config = "out/config.json";

export function saveConfig(data: Config) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(config, JSON.stringify(data), function(err) {
      if (err) reject(err);
      else resolve();
    });
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