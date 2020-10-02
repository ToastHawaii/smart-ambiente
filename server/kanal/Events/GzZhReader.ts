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

import { Event, FormReader } from "./Crawler";
import * as moment from "moment";
import * as cheerio from "cheerio";
import { getHtml } from "../../utils/request";
import debug from "../../utils/debug";
const topic = debug("Events/GzZhReader", false);

moment.locale("de");

type Items = { content: string };

type Item = Cheerio;

export const gzZhReader: FormReader<Items, Item> = {
  typ: "form",
  sourceName: "Zürcher Gemeinschaftszentren",
  sourceUrl: ["https://gz-zh.ch/wp/wp-admin/admin-ajax.php"],
  sourceBody: async () => {
    const body = await getHtml("https://gz-zh.ch");
    const match = /\"nonce\"\:\"([a-z0-9]+)\"/gi.exec(body);
    topic("match", match || {});
    if (!(match && match[1])) throw "nonce not found";
    return [
      `[action=more_post_ajax&nonce=${match[1]}&params%5Bpage%5D=1&params%5Bdates%5D%5B%5D=]DD.MM.YYYY[&params%5Bterms%5D%5Bzielgruppen%5D%5B%5D=erwachsene&params%5Btype%5D=angebote&params%5Bqty%5D=100&params%5Bpeople%5D=0]`
    ];
  },
  itemSelector: (listItems: Items) => {
    topic(listItems.content);
    const $ = cheerio.load(listItems.content);
    const elements: Cheerio[] = [];
    $("article").each((_i, e) => {
      elements.push($(e));
    });
    return elements;
  },
  sourceDetailUrl: (item: Item) => {
    return item.attr("data-link") || "";
  },
  mapper: (_listItem: Item, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const events: Event[] = [];

    const $e = $detailItem.find("article").first();
    const $img = $e.find("img");
    const dateTimePlace = ($e.find(".place-time").html() || "").split("<br>");
    const dateSplitted = dateTimePlace[0]
      .split(",")[1]
      .trim()
      .split(" ");
    const date =
      dateSplitted[0] + " " + dateSplitted[1] + ". " + dateSplitted[2];
    const startEnd = dateTimePlace[1].split("&#x2013;");

    let end = startEnd[1].trim();
    if (end === "00:00") end = "23:59";

    events.push({
      kategorie: $e.find(".cat-title").text(),
      titel: $e.find(".entry-title").text(),
      beschreibung: $e.find(".entry-content .col-xl-6:nth-child(2)").text(),
      start: moment(date + " " + startEnd[0].trim(), "Do MMM YYYY HH:mm"),
      ende: moment(date + " " + end, "Do MMM YYYY HH:mm"),
      ort: dateTimePlace[2],
      bild:
        $img && $img.attr("data-src")
          ? "https://gz-zh.ch/" + $img.attr("data-src")
          : ""
    });
    return events;
  }
};
