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

export const buehneSReader: HtmlReader = {
  typ: "html",
  sourceName: "Bühne S",
  sourceUrl: ["http://www.buehne-s.ch/spielplan"],
  itemSelector: ".spielplanTab tr",
  mapper: ($item: Cheerio) => {
    if ($item.find("th").text() || !$item.find(".date a").attr("name"))
      return [];

    const name = $item.find(".date a").attr("name");

    if (!name) throw "name is null";

    const date = name
      .split("-")
      .slice(1)
      .join("-");

    const start = moment(
      date + " " + $item.find("td.date > p + p + p").text(),
      "YYYY-MM-DD HH:mm [Uhr]",
      "de"
    );

    const event: Event = {
      titel: $item.find("td + td > h2").text(),
      beschreibung:
        $item.find("td + td > p").text() +
        " " +
        $item.find("td + td > .ticketinfo").text(),
      ort: "Bühne S",
      start: start
    };

    return [event];
  }
};
