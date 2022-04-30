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

export const casinotheaterReader: HtmlReader = {
  typ: "html",
  sourceName: "Casinotheater",
  sourceUrl: ["[https://www.casinotheater.ch/spielplan/]"],
  itemSelector: ".spielplan__item",
  sourceDetailUrl: ($item) => {
    return $item.find(".spielplan-details > a").attr("href") as string;
  },
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const event: Event = {
      titel:
        $listItem.find(".spielplan-details__content__title").text() +
        ", " +
        $listItem.find(".spielplan-details__content__description").text(),
      beschreibung: $detailItem.find(".content__tile p").text(),
      start: moment(
        $listItem.find(".spielplan-details__info__date").text(),
        "dd, MMMM Do YYYY, h:mm [Uhr]",
        "de"
      ),
      ort: "Casinotheater, " + $listItem.find(".event__info__place").text(),
      bild: $listItem.find(".spielplan__item__image img").attr("src"),
    };

    return [event];
  },
};
