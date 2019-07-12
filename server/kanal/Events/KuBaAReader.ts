import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";

export const kuBaAReader: HtmlReader = {
  typ: "html",
  sourceName: "kubaa.ch",
  sourceUrl: ["http://kubaa.ch/"],
  itemSelector: ".event",
  mapper: ($item: Cheerio) => {
    const event: Event = {
      titel: $item.find(".eventTitle").text(),
      beschreibung: $item.find(".eventDescription").text(),
      start: moment(
        $item.find(".eventTime").text(),
        "DD.MM.YY  HH:mm [UHR]",
        "de"
      ),
      ort: "KuBaA, Bachmannweg 16, 8046 Zürich"
    };

    const $img = $item.find("img");
    if ($img && $img.first() && $img.first().attr("src"))
      event.bild = $img.first().attr("src").replace(/\\"/gi, "");

    return [event];
  }
};
