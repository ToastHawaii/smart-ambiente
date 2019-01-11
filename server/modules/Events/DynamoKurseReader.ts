import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const dynamoKurseReader: HtmlReader = {
  typ: "html",
  sourceName: "Dynamo",
  sourceUrl: ["https://www.dynamo.ch/kurse"],
  itemSelector: ".node-kurs",
  sourceDetailUrl: $item => {
    return "https://www.dynamo.ch" + $item.find("a").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    const $img = $detailItem.find("#content .hero .header-image");
    let img: string | undefined = undefined;
    if ($img.length > 0) {
      img = $img.css("background-image");
      if (img) img = getUrls(img)[0];
    }

    const $date = $detailItem.find(
      "#content .pane-node-field-kurs-datum .date-display-single"
    );

    let dateFrom: string;
    let dateTo: string | undefined = undefined;
    if ($date.length > 0) {
      const dateTime = $date
        .first()
        .text()
        .split(", ")[1];
      dateFrom = dateTime;
    } else {
      dateFrom = $detailItem
        .find(
          "#content .pane-node-field-kurs-datum .date-display-range .date-display-start"
        )
        .first()
        .text()
        .split(", ")[1]
        .replace(/ \- /, " ");

      dateTo = $detailItem
        .find(
          "#content .pane-node-field-kurs-datum .date-display-range .date-display-end"
        )
        .first()
        .text()
        .split(", ")[1]
        .replace(/ \- /, " ");
    }

    events.push({
      titel:
        $detailItem.find("#content .pane-node-title").text() +
        " - " +
        $detailItem.find("#content .pane-node-field-kurs-subtitel").text(),
      beschreibung: $detailItem
        .find("#content .pane-node-field-kurs-description")
        .text(),
      start: moment(dateFrom + " 00:00", "Do MMMM YYYY HH:mm"),
      ende: dateTo
        ? moment(dateTo + " 00:00", "Do MMMM YYYY HH:mm")
        : undefined,
      ort: "Jugendkulturhaus Dynamo, Wasserwerkstrasse 21, 8006 Zürich",
      bild: img
    });

    return events;
  }
};
function getUrls(text: string): string[] {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  return matches;
}
