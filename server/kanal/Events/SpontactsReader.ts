import { HtmlReader } from "./Crawler";
import * as moment from "moment";

moment.locale("de");

export const spontactsReader: HtmlReader = {
  typ: "html",
  sourceName: "Spontacts",
  sourceUrl: [
    "[https://www.spontacts.com/activities?utf8=%E2%9C%93&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bradius%5D=20.0&filter%5Blocation%5D%5Blatitude%5D=47.368648529052734&filter%5Blocation%5D%5Blongitude%5D=8.539182662963867&filter%5Bdate%5D%5B%5D=]YYYY-MM-DD",
    "[https://www.spontacts.com/activities?utf8=%E2%9C%93&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bradius%5D=20.0&filter%5Blocation%5D%5Blatitude%5D=47.368648529052734&filter%5Blocation%5D%5Blongitude%5D=8.539182662963867&filter%5Bdate%5D%5B%5D=]YYYY-MM-DD[&page=2]",
    "[https://www.spontacts.com/activities?utf8=%E2%9C%93&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bcity%5D=zuerich&filter%5Blocation%5D%5Bradius%5D=20.0&filter%5Blocation%5D%5Blatitude%5D=47.368648529052734&filter%5Blocation%5D%5Blongitude%5D=8.539182662963867&filter%5Bdate%5D%5B%5D=]YYYY-MM-DD[&page=3]"
  ],
  itemSelector: "article.card > a",
  sourceDetailUrl: $item => {
    return $item.attr("href") || "";
  },
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    return [
      {
        kategorie: $detailItem.find(".activity .category").text(),
        titel: $detailItem.find(".activity .activity-title").text(),
        beschreibung:
          $detailItem.find(".activity .activity-description").text() +
          " " +
          $detailItem.find(".activity-description ~ p").text(),
        start: moment($detailItem.find(".activity .date").text(), "LL"),
        ort: $listItem.find(".place").text()
      }
    ];
  }
};
