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

export const zuriNetReader: HtmlReader = {
  typ: "html",
  sourceName: "zuri.net",
  sourceUrl: ["[https://zuri.net/de/zurich/agenda/mix/]DD-MM-YYYY"],
  itemSelector: '[itemtype="http://data-vocabulary.org/Event"]',
  mapper: ($item: Cheerio) => {
    const event: Event = {
      kategorie: $item.find('[itemprop="eventType"]').text(),
      titel: $item.find('[itemprop="name"]').text(),
      beschreibung: $item.find('[itemprop="description"]').text(),
      start: moment(
        $item.find('[itemprop="startDate"]').attr("datetime"),
        "YYYY-MM-DD HH:mm",
        "de"
      ),
      ort:
        $item
          .find('[itemprop="eventType"]')
          .siblings()
          .text() +
        " " +
        $item.find('[itemprop="location"]').text()
    };

    const endDate = $item.find('[itemprop="endDate"]').attr("datetime");
    if (endDate && endDate !== "1900-01-01 00:00")
      event.ende = moment(endDate, "YYYY-MM-DD HH:mm", "de");

    return [event];
  }
};
