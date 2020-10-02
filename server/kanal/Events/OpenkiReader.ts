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

import { JsonReader } from "./Crawler";
import * as moment from "moment";
import * as cheerio from "cheerio";
// import debug from "../../utils/debug";
// const topic = debug("Events/Openki", false);

type Items = {

  data: Item[];
};

type Item = {
  title: string;
  description: string;
  start: string;
  end: string;
  venue: { name: string; };
};

export const openkiReader: JsonReader<Items, Item> = {
  typ: "json",
  sourceName: "Openki",
  sourceUrl: ["[https://openki.net/api/0/json/events?after=]YYYY-MM-DD[T00:00&before=]YYYY-MM-DD[T23:59&region=J6GDhEEvdmdSMzPPF]"],

  itemSelector: (listItems: Items) => {
    return listItems.data;
  },
  mapper: (listItem: Item) => {

    const $ = cheerio.load("<body>" + listItem.description + "</body>");

    return [{
      titel: listItem.title,
      beschreibung: $("body").text(),
      start: moment(listItem.start),
      ende: moment(listItem.end),
      ort: listItem.venue.name,
    }];
  }
};
