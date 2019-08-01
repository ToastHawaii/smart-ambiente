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
