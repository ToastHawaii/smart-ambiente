import { HtmlReader } from "./Crawler";
import * as moment from "moment";

moment.locale("de");

export const pfirsiReader: HtmlReader = {
  typ:"html",
  sourceName: "pfirsi",
  sourceUrl: ["https://www.pfirsi.ch/events/anundpfirsich/"],
  itemSelector: ".et_pb_row a.et_pb_button",
  sourceDetailUrl: $item => {
    return $item.attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    if (
      $detailItem.find('[itemprop="location"] [itemprop="name"]').text() ===
      "ComedyHaus"
    )
      return [];

    return [
      {
        kategorie: "Impro-Comedy",
        titel:
          $detailItem.find(".entry-title").text() +
          " " +
          $detailItem.find(".aupev-subtitle").text(),
        beschreibung: $detailItem.find(".et_pb_text").text(),
        start: moment(
          $detailItem
            .find(".aupev-day")
            .text()
            .split(", ")[1] +
            $detailItem.find(".aupev-day")[0].nextSibling.nodeValue,
          "Do MMMM YYYY HH:mm [Uhr]"
        ),
        ort:
          $detailItem.find('[itemprop="location"] [itemprop="name"]').text() +
          "\n" +
          $detailItem
            .find('[itemprop="location"] [itemprop="address"]:nth-of-type(1)')
            .text(),
        bild: $detailItem
          .find(".et_parallax_bg")
          .css("background-image")
          .substring(
            5,
            $detailItem.find(".et_parallax_bg").css("background-image").length -
              2
          )
      }
    ];
  }
};
