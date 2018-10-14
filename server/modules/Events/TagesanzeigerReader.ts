import { Reader, Event } from "./Crawler";
import * as moment from "moment";
import * as $ from "cheerio";

export const tagesanzeigerChReader: Reader = {
  sourceName: "tagesanzeiger.ch",
  sourceUrl: [
    "[https://agenda.tagesanzeiger.ch/veranstaltungen/suche/neu/?postcode=ZH&search_from=]DD.MM.YYYY[&search_to=]DD.MM.YYYY"
  ],
  itemSelector: '.leo_event,meta[HTTP-EQUIV="REFRESH"]',
  sourceDetailUrl: $item => {
    if ($item.is('meta[HTTP-EQUIV="REFRESH"]'))
      return $item.attr("content").substr(7, $item.attr("content").length - 7);

    return $item.find(".leo_h3 a").attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    $detailItem.find(".dates p").each((_i, e) => {
      const $e = $(e);

      const date = $e.find(".leo_date_begin,.leo_date_end").text();
      const times = ($e.find(".leo_time").text() || "00:00")
        .split("-")
        .map(t => t.replace(/ Uhr( )?/g, ""));

      let start: moment.Moment;
      let ende: moment.Moment | undefined = undefined;

      start = moment(date + " " + times[0], "DD.MM.YYYY HH:mm");
      if (times.length > 1 && times[1])
        ende = moment(date + " " + times[1], "DD.MM.YYYY HH:mm");

      if ($e.is(".same_date")) {
        events[events.length - 1].ende = start;
        return;
      }

      const event: Event = {
        kategorie: $detailItem.find(".leo_event-details .category").text(),
        titel: $detailItem.find(".leo_event-headline").text(),
        beschreibung: $detailItem
          .find(".leo_event-details .description")
          .text(),
        start: start,
        ort: $detailItem.find(".location").text()
      };
      if (event.ende) event.ende = ende;
      events.push(event);
    });

    return events;
  }
};
