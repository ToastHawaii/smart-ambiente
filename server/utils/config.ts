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
    zeit: "05:43" | "06:43" | "07:43" | "08:43";
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
