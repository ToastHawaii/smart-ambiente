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

import * as request from "request";
import * as fs from "fs";

export function getJson<T>(url: string) {
  return new Promise<T>(resolve => {
    request.get(url, { json: true }, (_err, _res, body) => {
      resolve(body);
    });
  });
}

export function putJson(url: string, body: any) {
  return new Promise<void>(resolve => {
    request.put(url, { json: true, body: body }, () => {
      resolve();
    });
  });
}

export function postJson(url: string, body: any) {
  return new Promise<void>(resolve => {
    request.post(url, { json: true, body: body }, (error, _response, body) => {
      if (error) throw error;
      resolve(body);
    });
  });
}

export function postForm<T>(url: string, body: string) {
  return new Promise<T>(resolve => {
    request.post(url, { json: true, form: body }, (error, _response, body) => {
      if (error) throw error;
      resolve(body);
    });
  });
}

export function getHtml(sourceUrl: string) {
  return new Promise<string>(resolve =>
    request.get(
      {
        url: sourceUrl,
        headers: { "User-Agent": "request" }
      },
      (err, _res, body) => {
        if (err) console.error("error on request: " + err);
        resolve(body);
      }
    )
  );
}

export function readFile(path: string) {
  return new Promise<string>(resolve => {
    fs.readFile(path, "utf8", function (_err, data) {
      resolve(data);
    });
  });
}
