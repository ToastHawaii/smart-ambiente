import { Reader } from "./Crawler";
import * as moment from "moment";

export const zuerichUnbezahlbarReader: Reader = {
  sourceName: "Zürich unbezahlbar",
  sourceUrl: ["[http://www.zuerichunbezahlbar.ch/events/?date=]DD-MM-YYYY"],
  itemSelector: "article",
  sourceDetailUrl: $item => {
    return "http://www.zuerichunbezahlbar.ch/" + $item.find("a").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const date = $detailItem.find(".detailpost__date time").attr("datetime");
    const start =
      date +
      "T" +
      $detailItem
        .find(".detailpost__date time br")[0]
        .nextSibling.nodeValue.split("-")[0]
        .replace(/\s+/g, " ")
        .trim();
    const ende =
      date +
      "T" +
      $detailItem
        .find(".detailpost__date time br")[0]
        .nextSibling.nodeValue.split("-")[1]
        .replace(/\s+/g, " ")
        .trim();
    let img = $detailItem.find(".poster__image").attr("src");
    if (img.indexOf("/static/") === 0)
      img = "http://www.zuerichunbezahlbar.ch" + img;
    return [
      {
        kategorie: $detailItem.find(".detailpost__taglist").text(),
        titel: $detailItem.find(".poster__title-span-text").text(),
        beschreibung: $detailItem
          .find(".detailpost__description-text")
          .text()
          .replace(/\\"/g, '"'),
        start: moment(start),
        ende: moment(ende),
        ort: $detailItem.find(".detailpost__address").text(),
        bild: img
      }
    ];
  }
};