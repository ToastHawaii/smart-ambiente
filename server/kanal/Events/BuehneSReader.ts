import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const buehneSReader: HtmlReader = {
  typ: "html",
  sourceName: "Bühne S",
  sourceUrl: ["http://www.buehne-s.ch/spielplan"],
  itemSelector: ".spielplanTab tr",
  mapper: ($item: Cheerio) => {
    if ($item.find("th").text() || !$item.find(".date a").attr("name"))
      return [];

    const name = $item.find(".date a").attr("name");

    if (!name) throw "name is null";

    const date = name
      .split("-")
      .slice(1)
      .join("-");

    const start = moment(
      date + " " + $item.find("td.date > p + p + p").text(),
      "YYYY-MM-DD HH:mm [Uhr]",
      "de"
    );

    const event: Event = {
      titel: $item.find("td + td > h2").text(),
      beschreibung:
        $item.find("td + td > p").text() +
        " " +
        $item.find("td + td > .ticketinfo").text(),
      ort: "Bühne S",
      start: start
    };

    return [event];
  }
};
