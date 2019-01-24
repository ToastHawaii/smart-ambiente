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

    let timeFrom: string;
    let timeTo: string | undefined = undefined;
    const time = $detailItem
      .find(
        "#content .pane-node-field-kurs-zeitangabe .field-name-field-kurs-zeitangabe"
      )
      .first()
      .text();

    const timeFromMatch = /[0-2]?[0-9]((:|\.)[0-5][0-9])?/gi.exec(time);

    if (!timeFromMatch || !timeFromMatch[0]) throw "time not found";

    timeFrom = timeFromMatch[0].replace(/\./, ":");
    if (timeFrom.length <= 2) timeFrom += ":00";

    if (timeFrom.length < 5) timeFrom = "0" + timeFrom;

    const timeToMatch = /(\-|bis)(^[0-9])*([0-2]?[0-9]((:|\.)[0-5][0-9])?)/gi.exec(
      time
    );

    if (timeToMatch && timeToMatch[3]) {
      timeTo = timeToMatch[3].replace(/\./, ":");

      if (timeTo.length <= 2) timeTo += ":00";

      if (timeTo.length < 5) timeTo = "0" + timeTo;
    }

    if (dateTo) {
      let currentDate = moment(dateFrom + " 00:00", "Do MMMM YYYY HH:mm");
      const endDate = moment(dateTo + " 00:00", "Do MMMM YYYY HH:mm");

      if (!currentDate.isSameOrBefore(endDate)) throw "error in start end date";
      while (currentDate.isSameOrBefore(endDate)) {
        events.push({
          titel:
            $detailItem.find("#content .pane-node-title").text() +
            " - " +
            $detailItem.find("#content .pane-node-field-kurs-subtitel").text(),
          beschreibung: $detailItem
            .find("#content .pane-node-field-kurs-description")
            .text(),
          start: moment(
            currentDate.format("YYYY-MM-DD") + " " + timeFrom,
            "YYYY-MM-DD HH:mm"
          ),
          ende: timeTo
            ? moment(
                currentDate.format("YYYY-MM-DD") + " " + timeTo,
                "YYYY-MM-DD HH:mm"
              )
            : undefined,
          ort: "Jugendkulturhaus Dynamo, Wasserwerkstrasse 21, 8006 Zürich",
          bild: img
        });
        currentDate.add(1, "day");
      }
    } else {
      events.push({
        titel:
          $detailItem.find("#content .pane-node-title").text() +
          " - " +
          $detailItem.find("#content .pane-node-field-kurs-subtitel").text(),
        beschreibung: $detailItem
          .find("#content .pane-node-field-kurs-description")
          .text(),
        start: moment(dateFrom + " " + timeFrom, "Do MMMM YYYY HH:mm"),
        ende: timeTo
          ? moment(dateFrom + " " + timeTo, "Do MMMM YYYY HH:mm")
          : undefined,
        ort: "Jugendkulturhaus Dynamo, Wasserwerkstrasse 21, 8006 Zürich",
        bild: img
      });
    }

    return events;
  }
};
function getUrls(text: string): string[] {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  return matches;
}
