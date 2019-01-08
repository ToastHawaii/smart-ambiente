import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const zuriNetReader: HtmlReader = {
  typ: "html",
  sourceName: "zuri.net",
  sourceUrl: ["[https://zuri.net/de/zurich/agenda/mix/]DD-MM-YYYY"],
  itemSelector: ".agenda span.pre",
  mapper: ($item: Cheerio) => {
    const timeKategorie = $item.text().split(" | ");
    const startEnd = timeKategorie[0].split(" - ");
    const date = $item
      .parents(".card")
      .find(".subtitle")
      .text()
      .split(" ")[1];
    const event: Event = {
      kategorie: timeKategorie[1],
      titel: $item.next("h3").text(),
      beschreibung: $item
        .next("h3")
        .next()
        .text(),
      start: moment(date + " " + startEnd[0], "DD.MM.YYYY HH:mm"),
      ort:
        $item.next("a").text() +
        " " +
        $item
          .next("a")
          .next()
          .text()
    };

    if (startEnd[1])
      event.ende = moment(date + " " + startEnd[1], "DD.MM.YYYY HH:mm");

    return [event];
  }
};
