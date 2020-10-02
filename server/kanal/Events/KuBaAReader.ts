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
    if ($img && $img.first()) {
      const src = $img.first().attr("src");
      if (src) event.bild = src.replace(/\\"/gi, "");
    }

    return [event];
  }
};
