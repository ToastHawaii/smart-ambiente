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

export const tagesanzeigerChReader: HtmlReader = {
  typ: "html",
  sourceName: "tagesanzeiger.ch",
  sourceUrl: [
    "[https://agenda.tagesanzeiger.ch/veranstaltungen/suche/neu/?postcode=ZH&search_from=]DD.MM.YYYY[&search_to=]DD.MM.YYYY"
  ],
  itemSelector: '.leo_event,meta[HTTP-EQUIV="REFRESH"]',
  sourceDetailUrl: $item => {
    if ($item.is('meta[HTTP-EQUIV="REFRESH"]')) {
      const content = $item.attr("content");
      if (content) return content.substr(7, content.length - 7);
    }

    return $item.find(".leo_h3 a").attr("href") || "";
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find(".dates p").each((_i, e) => {
      const $e = $(e);

      const date = $e.find(".leo_date_begin,.leo_date_end").text();
      const times = ($e.find(".leo_time").text() || "00:00")
        .split("-")
        .map(t => t.replace(/ Uhr( )?/gi, ""));

      let start: moment.Moment;
      let ende: moment.Moment | undefined = undefined;

      start = moment(date + " " + times[0], "DD.MM.YYYY HH:mm");
      if (times.length > 1 && times[1])
        ende = moment(date + " " + times[1], "DD.MM.YYYY HH:mm");

      if ($e.is(".same_date")) {
        events[events.length - 1].ende = start;
        return;
      }

      const event: Event = {
        kategorie: $detailItem.find(".leo_event-details .category").text(),
        titel: $detailItem.find(".leo_event-headline").text(),
        beschreibung: $detailItem
          .find(".leo_event-details .description")
          .text(),
        start: start,
        ort: $detailItem.find(".location").text()
      };
      if (event.ende) event.ende = ende;
      events.push(event);
    });

    return events;
  }
};
