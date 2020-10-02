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

import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";
import * as $ from "cheerio";

export const comedyHausReader: HtmlReader = {
  typ: "html",
  sourceName: "ComedyHaus",
  sourceUrl: ["https://comedyhaus.ch/shows.html"],
  itemSelector: ".item",
  sourceDetailUrl: $item => {
    return "https://comedyhaus.ch/" + $item.find("a.more").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find(".table_ticket").each((_i, e) => {
      const $e = $(e);

      let img = $detailItem.find(".titelbild img").attr("src");
      if (img) img = "https://comedyhaus.ch/" + img;

      events.push({
        kategorie: $detailItem.find(".bereich").text(),
        titel:
          $detailItem.find(".titel").text() +
          " " +
          $detailItem.find(".teaser").text(),
        beschreibung: $detailItem.find(".description").text(),
        start: moment($e.text().split(": ")[1], "DD.MM.YYYY HH:mm [Uhr]"),
        ort: "ComedyHaus, Albisriederstrasse 16, 8003 Zürich",
        bild: img
      });
    });

    return events;
  }
};
