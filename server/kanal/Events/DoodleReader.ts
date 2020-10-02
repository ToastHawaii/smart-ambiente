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

type Items = {
  "title": string;
  "location"?: {
    "name": string;
  },
  "description": string;
  "options": {
    "startDateTime": number,
    "endDateTime": number
  }[],
};

type Item = {
  "title": string;
  "location"?: string;
  "description": string;
  "startDateTime": number;
  "endDateTime": number;
};

export const doodleReader: JsonReader<Items, Item> = {
  typ: "json",
  sourceName: "Doodle",
  sourceUrl: [
    "https://doodle.com/api/v2.0/polls/nv9sbn37z3kwbtyk?adminKey=&participantKey=",
    "https://doodle.com/api/v2.0/polls/9kc6f7cgbzigec6a?adminKey=&participantKey="
  ],
  itemSelector: (listItems: Items) => {
    return listItems.options.map(o => ({
      "title": listItems.title,
      "description": listItems.description,
      "location": listItems.location && listItems.location.name,
      "startDateTime": o.startDateTime,
      "endDateTime": o.endDateTime
    }));
  },
  mapper: (listItem: Item) => {

    return [{
      titel: listItem.title,
      beschreibung: listItem.description,
      start: moment(listItem.startDateTime),
      ende: moment(listItem.endDateTime),
      ort: listItem.location
    }];
  }
};
