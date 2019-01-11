import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const dynamoVeranstaltungenReader: HtmlReader = {
  typ: "html",
  sourceName: "Dynamo",
  sourceUrl: ["https://www.dynamo.ch/veranstaltungen"],
  itemSelector: ".node-event",
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

    const $dateTime = $detailItem.find(
      "#content .pane-node-field-event-zeitraum .date-display-single"
    );

    let dateTimeFrom: string;
    let dateTimeTo: string;
    if ($dateTime.length > 0) {
      const dateTime = $dateTime
        .first()
        .text()
        .split(", ")[1];

      const date = dateTime.split(" - ")[0];
      const time = dateTime.split(" - ")[1];

      const timeFrom = time.split(" bis ")[0];
      const timeTo = time.split(" bis ")[1];

      dateTimeFrom = date + " " + timeFrom;
      dateTimeTo = date + " " + timeTo;
    } else {
      dateTimeFrom = $detailItem
        .find(
          "#content .pane-node-field-event-zeitraum .date-display-range .date-display-start"
        )
        .first()
        .text()
        .split(", ")[1]
        .replace(/ \- /, " ");

      dateTimeTo = $detailItem
        .find(
          "#content .pane-node-field-event-zeitraum .date-display-range .date-display-end"
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
        $detailItem.find("#content .pane-node-field-event-subtitel").text(),
      beschreibung: $detailItem
        .find("#content .pane-node-field-event-description")
        .text(),
      start: moment(dateTimeFrom, "Do MMMM YYYY h:mm"),
      ende: dateTimeTo ? moment(dateTimeTo, "Do MMMM YYYY h:mm") : undefined,
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
