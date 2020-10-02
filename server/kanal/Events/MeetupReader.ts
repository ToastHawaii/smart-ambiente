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
import debug from "../../utils/debug";
const topic = debug("Events/MeetupReader", false);

export const meetupReader: HtmlReader = {
  typ: "html",
  sourceName: "meetup.com",
  sourceUrl: [
    "[https://www.meetup.com/de-DE/find/events/?allMeetups=true&radius=16&userFreeform=Z%C3%BCrich%2C+Schweiz&mcId=z1005076&mcName=Z%C3%BCrich%2C+CH&month=]M[&day=]D[&year=]YYYY"
  ],
  itemSelector: '[itemtype="http://data-vocabulary.org/Event"]',
  sourceDetailUrl: $item => {
    return $item.find('.event[itemprop="url"]').attr("href") || "";
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const eventJson =
      $detailItem
        .parent()
        .find('script[type="application/ld+json"]')
        .first()
        .html() || "";

    const startDate = /\"startDate\":\"([0-9\-\:T\+]+)\"/gi.exec(eventJson);
    const endDate = /\"endDate\":\"([0-9\-\:T\+]+)\"/gi.exec(eventJson);
    const location = /\"PostalAddress\",\"streetAddress\":\"([^\\"]+)\",\"addressLocality\":\"([^\\"]+)\"/gi.exec(
      eventJson
    );

    topic("event", { content: eventJson, startDate, endDate, location });

    if (!(startDate && startDate[1])) return [];

    let kategories = (
      $detailItem
        .parent()
        .find("meta[name=keywords]")
        .attr("content") || ""
    ).split(",");

    kategories = kategories.slice(0, kategories.length - 3);

    const event: Event = {
      kategorie: kategories.join(", "),
      titel: $detailItem.find("h1").text(),
      beschreibung: $detailItem.find(".event-description").text(),
      start: moment(startDate[1]),
      ende: endDate && endDate[1] ? moment(endDate[1]) : undefined,
      ort: location && location[1] ? `${location[1]} ${location[2]}` : undefined
    };

    return [event];
  }
};
