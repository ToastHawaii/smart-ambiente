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

export const eventsChReader: HtmlReader = {
  typ:"html",
  sourceName: "events.ch",
  sourceUrl: [
    "[https://events.ch/de/events/pager?filter=eventData.venueFloor.venue.city.zip%3E%3D8000%2CeventData.venueFloor.venue.city.zip%3C8600%2Cstartdate%3E%3D]YYYY-MM-DD[%2000%3A00%3A00&range=0-119]"
  ],
  itemSelector: '[itemtype="http://schema.org/Event"]',

  sourceDetailUrl: $item => {
    return "https://events.ch" + $item.find('[itemprop="url"]').attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    let img =
      $detailItem.find('[itemprop="image"]').attr("src") ||
      ($detailItem
        .find('[itemprop="image"]')
        .attr("srcset") || "")
        .split(" ")[0];
    // console.info($detailItem.find('[itemprop="startDate"]').attr("datetime"));
    const event: Event = {
      kategorie: $detailItem.find(".event-category").text(),
      titel: $detailItem.find('.event-title[itemprop="name"]').text(),
      beschreibung: $detailItem
        .find(".event-description")
        .text()
        .replace(/\\"/g, '"'),
      start: moment(
        $detailItem.find('[itemprop="startDate"]').attr("datetime")
      ),
      ort:
        $detailItem.find('[itemprop="location"] [itemprop="name"]').text() +
        "\n" +
        $detailItem
          .find('[itemprop="location"] [itemprop="address"]:nth-of-type(1)')
          .text()
    };

    if (img) event.bild = "https://events.ch" + img;
    return [event];
  }
};
