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

export const dynamoKurseReader: HtmlReader = {
  typ: "html",
  sourceName: "Dynamo",
  sourceUrl: ["https://www.dynamo.ch/kurse"],
  itemSelector: ".node-kurs",
  sourceDetailUrl: $item => {
    return "https://www.dynamo.ch" + $item.find("a").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    const $img = $detailItem.find("#content .hero .header-image");
    let img: string | undefined = undefined;
    if ($img.length > 0) {
      img = $img.css("background-image");
      if (img) img = getUrls(img)[0];
    }

    const $date = $detailItem.find(
      "#content .pane-node-field-kurs-datum .date-display-single"
    );

    let dateFrom: string;
    let dateTo: string | undefined = undefined;
    if ($date.length > 0) {
      const dateTime = $date
        .first()
        .text()
        .split(", ")[1];
      dateFrom = dateTime;
    } else {
      dateFrom = $detailItem
        .find(
          "#content .pane-node-field-kurs-datum .date-display-range .date-display-start"
        )
        .first()
        .text()
        .split(", ")[1]
        .replace(/ \- /, " ");

      dateTo = $detailItem
        .find(
          "#content .pane-node-field-kurs-datum .date-display-range .date-display-end"
        )
        .first()
        .text()
        .split(", ")[1]
        .replace(/ \- /, " ");
    }

    let timeFrom: string | undefined;
    let timeTo: string | undefined = undefined;
    const time = $detailItem
      .find(
        "#content .pane-node-field-kurs-zeitangabe .field-name-field-kurs-zeitangabe"
      )
      .first()
      .text();

    const timeFromMatch = /[0-2]?[0-9]((:|\.)[0-5][0-9])?/gi.exec(time);

    if (timeFromMatch && timeFromMatch[0]) {
      timeFrom = timeFromMatch[0].replace(/\./, ":");
      if (timeFrom.length <= 2) timeFrom += ":00";

      if (timeFrom.length < 5) timeFrom = "0" + timeFrom;

      const timeToMatch = /(\-|bis)(^[0-9])*([0-2]?[0-9]((:|\.)[0-5][0-9])?)/gi.exec(
        time
      );

      if (timeToMatch && timeToMatch[3]) {
        timeTo = timeToMatch[3].replace(/\./, ":");

        if (timeTo.length <= 2) timeTo += ":00";

        if (timeTo.length < 5) timeTo = "0" + timeTo;

        if (timeTo === "00:00") timeTo = "23:59";
      }
    }

    if (dateTo) {
      let currentDate = moment(dateFrom + " 00:00", "Do MMMM YYYY HH:mm");
      const endDate = moment(dateTo + " 00:00", "Do MMMM YYYY HH:mm");

      if (!currentDate.isSameOrBefore(endDate)) throw "error in start end date";
      while (currentDate.isSameOrBefore(endDate)) {
        events.push({
          titel:
            $detailItem.find("#content .pane-node-title").text() +
            " - " +
            $detailItem.find("#content .pane-node-field-kurs-subtitel").text(),
          beschreibung: $detailItem
            .find("#content .pane-node-field-kurs-description")
            .text(),
          start: timeFrom
            ? moment(
                currentDate.format("YYYY-MM-DD") + " " + timeFrom,
                "YYYY-MM-DD HH:mm"
              )
            : moment(currentDate, "LL"),
          ende: timeTo
            ? moment(
                currentDate.format("YYYY-MM-DD") + " " + timeTo,
                "YYYY-MM-DD HH:mm"
              )
            : undefined,
          ort: "Jugendkulturhaus Dynamo, Wasserwerkstrasse 21, 8006 Zürich",
          bild: img
        });
        currentDate.add(1, "day");
      }
    } else {
      events.push({
        titel:
          $detailItem.find("#content .pane-node-title").text() +
          " - " +
          $detailItem.find("#content .pane-node-field-kurs-subtitel").text(),
        beschreibung: $detailItem
          .find("#content .pane-node-field-kurs-description")
          .text(),
        start: timeFrom
          ? moment(dateFrom + " " + timeFrom, "YYYY-MM-DD HH:mm")
          : moment(dateFrom, "LL"),
        ende: timeTo
          ? moment(dateFrom + " " + timeTo, "Do MMMM YYYY HH:mm")
          : undefined,
        ort: "Jugendkulturhaus Dynamo, Wasserwerkstrasse 21, 8006 Zürich",
        bild: img
      });
    }

    return events;
  }
};
function getUrls(text: string): string[] {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  return matches;
}
