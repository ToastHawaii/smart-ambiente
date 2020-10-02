// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

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
