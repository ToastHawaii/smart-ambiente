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

export const pfirsiReader: HtmlReader = {
  typ: "html",
  sourceName: "pfirsi",
  sourceUrl: ["https://www.pfirsi.ch/events/anundpfirsich/"],
  itemSelector: ".btTxt.et_pb_promo_button.et_pb_button",
  sourceDetailUrl: $item => {
    return $item.attr("href") || "";
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
