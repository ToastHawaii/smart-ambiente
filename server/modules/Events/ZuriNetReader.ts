import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const zuriNetReader: HtmlReader = {
  typ: "html",
  sourceName: "zuri.net",
  sourceUrl: ["[https://zuri.net/de/zurich/agenda/mix/]DD-MM-YYYY"],
  itemSelector: '[itemtype="http://data-vocabulary.org/Event"]',
  mapper: ($item: Cheerio) => {
    const event: Event = {
      kategorie: $item.find('[itemprop="eventType"]').text(),
      titel: $item.find('[itemprop="name"]').text(),
      beschreibung: $item.find('[itemprop="description"]').text(),
      start: moment(
        $item.find('[itemprop="startDate"]').attr("datetime"),
        "YYYY-MM-DD HH:mm",
        "de"
      ),
      ort:
        $item
          .find('[itemprop="eventType"]')
          .siblings()
          .text() +
        " " +
        $item.find('[itemprop="location"]').text()
    };

    const endDate = $item.find('[itemprop="endDate"]').attr("datetime");
    if (endDate && endDate !== "1900-01-01 00:00")
      event.ende = moment(endDate, "YYYY-MM-DD HH:mm", "de");

    return [event];
  }
};
