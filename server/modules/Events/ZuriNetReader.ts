import { Reader, Event } from "./Crawler";
import * as moment from "moment";

export const zuriNetReader: Reader = {
  sourceName: "zuri.net",
  sourceUrl: ["[https://zuri.net/agenda/alles/]DD.MM.YYYY"],
  itemSelector: '[itemtype="http://data-vocabulary.org/Event"]',
  mapper: ($item: Cheerio) => {
    const event: Event = {
      kategorie: $item.find('[itemprop="eventType"]').text(),
      titel: $item.find('[itemprop="name"]').text(),
      beschreibung: $item.find('[itemprop="description"]').text(),
      start: moment($item.find('[itemprop="startDate"]').attr("datetime")),
      ort:
        $item
          .find('[itemprop="eventType"]')
          .siblings()
          .text() +
        " " +
        $item.find('[itemprop="location"]').text()
    };

    if (
      $item.find('[itemprop="endDate"]').attr("datetime") !== "1900-01-01T00:00"
    )
      event.ende = moment($item.find('[itemprop="endDate"]').attr("datetime"));

    return [event];
  }
};
