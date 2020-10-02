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

import { HtmlReader } from "./Crawler";
import * as moment from "moment";

export const zuerichUnbezahlbarReader: HtmlReader = {
  typ: "html",
  sourceName: "Zürich unbezahlbar",
  sourceUrl: [
    "[http://www.zuerichunbezahlbar.ch/events/?page=1&date=]YYYY-MM-DD",
    "[http://www.zuerichunbezahlbar.ch/events/?page=2&date=]YYYY-MM-DD",
    "[http://www.zuerichunbezahlbar.ch/events/?page=3&date=]YYYY-MM-DD"
  ],
  itemSelector: "article",
  sourceDetailUrl: $item => {
    return "http://www.zuerichunbezahlbar.ch" + $item.find("a").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];
    if (($detailItem.html() || "").indexOf("Entschuldige, leider") >= 0)
      return [];

    const date = $detailItem.find(".detailpost__date time").attr("datetime");
    const start =
      date +
      "T" +
      $detailItem
        .find(".detailpost__date time br")[0]
        .nextSibling.nodeValue.split("-")[0]
        .replace(/\s+/gi, " ")
        .trim();
    const ende =
      date +
      "T" +
      $detailItem
        .find(".detailpost__date time br")[0]
        .nextSibling.nodeValue.split("-")[1]
        .replace(/\s+/gi, " ")
        .trim();

    let img = $detailItem.find(".poster__image").attr("src");
    if (img && img.indexOf("/static/") === 0)
      img = "http://www.zuerichunbezahlbar.ch" + img;

    return [
      {
        kategorie: $detailItem.find(".detailpost__taglist").text(),
        titel: $detailItem.find(".poster__title-span-text").text(),
        beschreibung: $detailItem
          .find(".detailpost__description-text")
          .text()
          .replace(/\\"/g, '"'),
        start: moment(start),
        ende: moment(ende),
        ort: $detailItem.find(".detailpost__address").text(),
        bild: img
      }
    ];
  }
};
