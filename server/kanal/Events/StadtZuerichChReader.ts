import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";
import debug from "../../utils/debug";
const topic = debug("StadtZuerichChReader", false);

export const stadtZuerichChReader: HtmlReader = {
  typ: "html",
  sourceName: "stadt-zuerich.ch",
  sourceUrl: [
    "[https://www.stadt-zuerich.ch/portal/de/index/aktuelles/agenda/veranstaltungen_suche_archiv.html?q=&q_category=&q_date=]DD.MM.YYYY[&q_dateend=]DD.MM.YYYY[&q_target_groups=targetgroups%3Aerwachsene&q_venue=&name=&q_zip=&q_type=eventplus&limit=100]"
  ],
  itemSelector: ".var_event_search_result a",
  sourceDetailUrl: $item => {
    return "https://www.stadt-zuerich.ch" + $item.attr("href");
  },
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const date = (
      $listItem.find(".mod_eventinfo__date").attr("datetime") || ""
    ).split("T")[0];
    const time = $listItem
      .find(".mod_eventinfo__time")
      .text()
      .split("–");
    const start = time[0];
    const ende = time[1];
    topic("Start - Ende", {
      start: date + " " + start,
      ende: date + " " + ende
    });
    const event: Event = {
      kategorie: $detailItem.find("#event h2").text(),
      titel: $detailItem.find("#event h1").text(),
      beschreibung: $detailItem
        .find("#event p.lead,#event .contentitem p")
        .text(),
      start: moment(date + " " + start, "YYYY-MM-DD H.mm", "de"),
      ende: moment(date + " " + ende, "YYYY-MM-DD H.mm [Uhr]", "de"),
      ort: $listItem.find("#event .mod_eventinfo__location").text()
    };

    if ($detailItem.find("#event img").attr("src"))
      event.bild =
        "https://www.stadt-zuerich.ch/" +
        $detailItem.find("#event img").attr("src");
    return [event];
  }
};
