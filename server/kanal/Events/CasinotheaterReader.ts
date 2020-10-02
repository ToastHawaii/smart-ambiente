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

import { JsonReader, Event } from "./Crawler";
import * as moment from "moment";
import * as $ from "cheerio";
import debug from "../../utils/debug";
import { flatten } from "../../utils/array";
const topic = debug("Events/CasinotheaterReader", false);

type Items = {
  date: number;
  performances: Item[];
}[];

type Item = {
  date: number;
  humanDate: string;
  name: string;
  headline: string;
  shortDescription: string;
  smallImage: string;
  displayGenre: string;
  customStatus: number;
  displayTicketButton: boolean;
  links: { detail: string; tickets: string };
};

export const casinotheaterReader: JsonReader<Items, Item> = {
  typ: "json",
  sourceName: "Casinotheater",
  sourceUrl: ["https://www.casinotheater.ch/api/artists"],
  itemSelector: (listItems: Items) => {
    topic(
      "itemSelector",
      flatten(listItems.map(i => i.performances)).filter(i => {
        topic("item", i);
        return i.displayTicketButton;
      })
    );
    return flatten(listItems.map(i => i.performances)).filter(i => {
      return i.displayTicketButton;
    });
  },
  sourceDetailUrl: (item: Item) => {
    return item.links.detail.replace(
      /\/\/www\.casinotheater\.ch/gi,
      "https://www.casinotheater.ch"
    );
  },
  mapper: (listItem: Item, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find(".-artist-detail").each((_i, e) => {
      const $e = $(e);

      events.push({
        kategorie: listItem.displayGenre,
        titel: listItem.headline,
        beschreibung: $e.find("p").text(),
        start: moment(listItem.humanDate, "DD.MM.YYYY HH:mm"),
        ort:
          "Casinotheater Winterthur AG, Stadthausstrasse 119, 8400 Winterthur",
        bild: listItem.smallImage.replace(
          /\/\/www\.casinotheater\.ch/gi,
          "https://www.casinotheater.ch"
        )
      });
    });

    return events;
  }
};
