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

export const opkenkiReader: JsonReader<Items, Item> = {
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
