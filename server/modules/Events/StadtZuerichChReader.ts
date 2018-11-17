import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const stadtZuerichChReader: HtmlReader = {
  typ:"html",
  sourceName: "stadt-zuerich.ch",
  sourceUrl: [
    "[https://www.stadt-zuerich.ch/portal/de/index/aktuelles/agenda/veranstaltungen_suche_archiv.html?q=&q_category=&q_date=]DD.MM.YYYY[&q_type=event&limit=100]"
  ],
  itemSelector: ".mod_table tbody tr",
  sourceDetailUrl: $item => {
    return "https://www.stadt-zuerich.ch" + $item.find("a").attr("href");
  },
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const dateTime = $listItem
      .find("td")
      .first()
      .text()
      .split(" - ");
    const start = dateTime[0].split(", ");
    const ende = dateTime[1].split(", ");

    let startDateTime = start[0];
    let endeDateTime = ende[0];
    if (start.length > 1) startDateTime += " " + start[1];
    else if (ende.length > 1) startDateTime += " " + ende[1];
    else startDateTime += " 0.00";

    if (ende.length > 1) endeDateTime += " " + ende[1];
    else endeDateTime += " 0.00";

    startDateTime = startDateTime
      .replace("Sept.", "September")
      .replace("Febr.", "Februar");
    endeDateTime = endeDateTime
      .replace("Sept.", "September")
      .replace("Febr.", "Februar");

    const event: Event = {
      titel: $detailItem.find("#event #event_title").text(),
      beschreibung: $detailItem.find("#event > p").text(),
      start: moment(
        startDateTime,
        ["dd Do MMM YYYY H.mm", "dd Do MMM. YYYY H.mm", "dd Do MMMM YYYY H.mm"],
        "de"
      ),
      ende: moment(
        endeDateTime,
        ["dd Do MMM YYYY H.mm", "dd Do MMM. YYYY H.mm", "dd Do MMMM YYYY H.mm"],
        "de"
      ),
      ort: $listItem
        .find("td")
        .last()
        .text()
    };

    if ($detailItem.find("#event img").attr("src"))
      event.bild =
        "https://www.stadt-zuerich.ch/" +
        $detailItem.find("#event img").attr("src");
    return [event];
  }
};
