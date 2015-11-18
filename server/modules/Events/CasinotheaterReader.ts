import { JsonReader, Event } from "./Crawler";
import * as moment from "moment";
import * as $ from "cheerio";
import debug from "../../utils/debug";
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
        return !i.displayTicketButton;
      })
    );
    return flatten(listItems.map(i => i.performances)).filter(i => {
      return !i.displayTicketButton;
    });
  },
  sourceDetailUrl: (item: Item) => {
    return item.links.detail;
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
        bild: listItem.smallImage
      });
    });

    return events;
  }
};

function flatten<T>(arr: T[][]): T[] {
  return [].concat.apply([], arr);
}
