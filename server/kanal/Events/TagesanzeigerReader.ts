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

export const tagesanzeigerChReader: HtmlReader = {
  typ: "html",
  sourceName: "tagesanzeiger.ch",
  sourceUrl: [
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=2]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=3]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=4]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=5]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=6]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=7]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=8]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=9]",
    "[https://agenda.tagesanzeiger.ch/veranstaltungen.html?page=10]",
  ],
  itemSelector: ".overview-event",
  mapper: ($item: Cheerio) => {
    const event: Event = {
      kategorie: $item.find(".overview-event__info__category").text(),
      titel: $item.find(".overview-event__info__title").text(),
      beschreibung: $item.find(".overview-event__info__description").text(),
      start: moment(
        $item.find(".overview-event__date").text().split("<br>")[1],
        "DD.MM.YY, HH:mm[&nbsp;Uhr]",
        "de"
      ),
      ort: $item.find(".overview-event__info__location").text(),
      bild:
        "https://agenda.tagesanzeiger.ch/" +
        $item.find(".overview-event__image img").attr("src"),
    };

    return [event];
  },
};
