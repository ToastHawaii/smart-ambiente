import { Event, FormReader } from "./Crawler";
import * as moment from "moment";
import * as cheerio from "cheerio";
import debug from "../../utils/debug";
const topic = debug("Events/GzZhReader", false);

moment.locale("de");

type Items = { content: string };

type Item = Cheerio;

export const gzZhReader: FormReader<Items, Item> = {
  typ: "form",
  sourceName: "Zürcher Gemeinschaftszentren",
  sourceUrl: ["https://gz-zh.ch/wp/wp-admin/admin-ajax.php"],
  sourceBody: [
    "[action=more_post_ajax&nonce=fdecf310e1&params%5Bpage%5D=1&params%5Bdates%5D%5B%5D=]DD.MM.YYYY[&params%5Bterms%5D%5Bzielgruppen%5D%5B%5D=erwachsene&params%5Btype%5D=angebote&params%5Bqty%5D=100&params%5Bpeople%5D=0]"
  ],
  itemSelector: (listItems: Items) => {
    topic(listItems.content);
    const $ = cheerio.load(listItems.content);
    const elements: Cheerio[] = [];
    $("article").each((_i, e) => {
      elements.push($(e));
    });
    return elements;
  },
  sourceDetailUrl: (item: Item) => {
    return item.attr("data-link");
  },
  mapper: (_listItem: Item, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find("article").each((_i, e) => {
      const $e = cheerio(e);
      const $img = $e.find("img");
      const dateTimePlace = ($e.find(".place-time").html() || "").split("<br>");
      const dateSplitted = dateTimePlace[0]
        .split(",")[1]
        .trim()
        .split(" ");
      const date =
        dateSplitted[0] + " " + dateSplitted[1] + ". " + dateSplitted[2];
      const startEnd = dateTimePlace[1].split("&#x2013;");

      events.push({
        kategorie: $e.find(".cat-title").text(),
        titel: $e.find(".entry-title").text(),
        beschreibung: $e
          .find(".entry-content .col-md-6.col-xl-6:nth-child(2)")
          .text(),
        start: moment(date + " " + startEnd[0].trim(), "Do MMM YYYY HH:mm"),
        ende: moment(date + " " + startEnd[1].trim(), "Do MMM YYYY HH:mm"),
        ort: dateTimePlace[2],
        bild: $img ? "https://gz-zh.ch/" + $img.attr("data-src") : ""
      });
    });

    return events;
  }
};