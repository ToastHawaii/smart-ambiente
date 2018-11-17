import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";
import * as $ from "cheerio";

export const comedyHausReader: HtmlReader = {
  typ:"html",
  sourceName: "ComedyHaus",
  sourceUrl: ["https://comedyhaus.ch/shows.html"],
  itemSelector: ".item",
  sourceDetailUrl: $item => {
    return "https://comedyhaus.ch/" + $item.find("a.more").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find(".table_ticket").each((_i, e) => {
      const $e = $(e);

      let img = $detailItem.find(".titelbild img").attr("src");
      if (img) img = "https://comedyhaus.ch/" + img;

      events.push({
        kategorie: $detailItem.find(".bereich").text(),
        titel:
          $detailItem.find(".titel").text() +
          " " +
          $detailItem.find(".teaser").text(),
        beschreibung: $detailItem.find(".description").text(),
        start: moment($e.text().split(": ")[1], "DD.MM.YYYY HH:mm [Uhr]"),
        ort: "ComedyHaus, Albisriederstrasse 16, 8003 Zürich",
        bild: img
      });
    });

    return events;
  }
};
