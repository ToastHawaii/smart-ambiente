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

import { stadtZuerichChReader } from "./StadtZuerichChReader";
import { zuerichUnbezahlbarReader } from "./ZuerichUnbezahlbarReader";
import { eventsChReader } from "./EventsChReader";
import { tagesanzeigerChReader } from "./TagesanzeigerReader";
import { zuriNetReader } from "./ZuriNetReader";
import { comedyHausReader } from "./ComedyHausReader";
import { pfirsiReader } from "./PfirsiReader";
import { casinotheaterReader } from "./CasinotheaterReader";
import { dynamoVeranstaltungenReader } from "./DynamoVeranstaltungenReader";
import { dynamoKurseReader } from "./DynamoKurseReader";
import { gzZhReader } from "./GzZhReader";
//import { meetupReader } from "./MeetupReader";
import * as Calendar from "./Calendar";
import * as moment from "moment";
import * as cheerio from "cheerio";
import { getHtml, getJson, postForm } from "../../utils/request";
import { inspect } from "util";
import debug from "../../utils/debug";
import { kuBaAReader } from "./KuBaAReader";
import { buehneSReader } from "./BuehneSReader";
import { mapsZueriAgendaReader } from "./MapsZueriAgendaReader";
import { stadtZuerichSozialdepartementReader } from "./StadtZuerichSozialdepartementReader";
import { doodleReader } from "./DoodleReader";
//import { spontactsReader } from "./SpontactsReader";
import { openkiReader } from "./OpenkiReader";
const topic = debug("Events/Crawler", true);

export interface Event {
  kategorie?: string;
  titel: string;
  beschreibung?: string;
  bild?: string;
  start: moment.Moment;
  ende?: moment.Moment;
  ort?: string;
}

type Reader =
  | StaticReader
  | HtmlReader
  | JsonReader<any, any>
  | FormReader<any, any>;

export interface StaticReader {
  typ: "static";
  sourceName: string;
  get: () => Event[];
}

export interface HtmlReader {
  typ: "html";
  sourceName: string;
  sourceUrl: string[];
  itemSelector: string;
  sourceDetailUrl?: ($listItem: Cheerio) => string;
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => Event[];
}

export interface JsonReader<A, I> {
  typ: "json";
  sourceName: string;
  sourceUrl: string[];
  itemSelector: (listItems: A) => I[];
  sourceDetailUrl?: (listItem: I) => string;
  mapper: (listItem: I, $detailItem?: Cheerio) => Event[];
}

export interface FormReader<A, I> {
  typ: "form";
  sourceName: string;
  sourceUrl: string[];
  sourceBody: () => Promise<string[]>;
  itemSelector: (listItems: A) => I[];
  sourceDetailUrl?: (listItem: I) => string;
  mapper: (listItem: I, $detailItem?: Cheerio) => Event[];
}

const readers: Reader[] = [
  stadtZuerichSozialdepartementReader,
  stadtZuerichChReader,
  zuerichUnbezahlbarReader,
  eventsChReader,
  tagesanzeigerChReader,
  zuriNetReader,
  kuBaAReader,
  comedyHausReader,
  pfirsiReader,
  casinotheaterReader,
  dynamoVeranstaltungenReader,
  dynamoKurseReader,
  gzZhReader,
  // meetupReader,
  // spontactsReader,
  openkiReader,
  mapsZueriAgendaReader,
  buehneSReader,
  doodleReader
];

function params(param: string): string[] {
  if (param.indexOf("[") === -1) return [param];

  const params: string[] = [];
  let day = moment();
  for (let i = 0; i < 8; i++) {
    params.push(day.format(param));
    day = day.add(1, "day");
  }

  return params;
}

function selectMany(f: any) {
  return function(acc: any, b: any) {
    return acc.concat(f(b));
  };
}

export async function crawel(
  persist: (event: Calendar.Event) => Promise<void>
) {
  for (const reader of readers) {
    if (reader.typ === "html") await crawelHtml(reader, persist);
    else if (reader.typ === "json") await crawelJson(reader, persist);
    else if (reader.typ === "static") await crawelStatic(reader, persist);
    else await crawelForm(reader, persist);
  }
}

async function crawelHtml(
  reader: HtmlReader,
  persist: (event: Calendar.Event) => Promise<void>
) {
  topic(reader.sourceName);
  const sourceUrls = reader.sourceUrl
    .map(u => params(u))
    .reduce(
      selectMany((x: any) => x),
      []
    );

  let count = 0;
  for (const sourceUrl of sourceUrls) {
    try {
      topic("GET " + sourceUrl);
      let body = await getHtml(sourceUrl);

      const $ = cheerio.load(body);

      const elements: Cheerio[] = [];
      $(reader.itemSelector).each((_i, e) => {
        elements.push($(e));
      });

      count += elements.length;
      for (const $e of elements) {
        try {
          if (!reader.sourceDetailUrl)
            await transformPersist(persist, reader, reader.mapper($e));
          else {
            const detailUrl = reader.sourceDetailUrl($e);

            topic("GET " + detailUrl);
            body = await getHtml(detailUrl);

            if (!body) {
              console.error("body is null on GET " + detailUrl);
              return;
            }

            const $ = cheerio.load(body);
            await transformPersist(
              persist,
              reader,
              reader.mapper($e, $("body"))
            );
          }
        } catch (err) {
          const now = moment();
          const error = {
            titel: "Error in " + reader.sourceName,
            beschreibung: `${err}\n${inspect($e)}\n${sourceUrl}`,
            kategorie: "Error",
            start: now,
            quelle: reader.sourceName,
            createdAt: now
          };
          topic(body);
          topic("Error", error);
          await persist(error);
        }
      }
    } catch (err) {
      const now = moment();
      const error = {
        titel: "Error in " + reader.sourceName,
        beschreibung: `${err}\n${sourceUrl}`,
        kategorie: "Error",
        start: now,
        quelle: reader.sourceName,
        createdAt: now
      };
      topic("Error", error);
      await persist(error);
    }
  }
  if (count === 0) {
    const now = moment();
    const error = {
      titel: "Error in " + reader.sourceName,
      beschreibung: `Keine Events gefunden`,
      kategorie: "Error",
      start: now,
      quelle: reader.sourceName,
      createdAt: now
    };
    topic("Error", error);
    await persist(error);
  }
}

async function crawelForm<T>(
  reader: FormReader<any, any>,
  persist: (event: Calendar.Event) => Promise<void>
) {
  topic(reader.sourceName);
  const sourceUrls = reader.sourceUrl
    .map(u => params(u))
    .reduce(
      selectMany((x: any) => x),
      []
    );

  const sourceBodys = (await reader.sourceBody())
    .map(u => params(u))
    .reduce(
      selectMany((x: any) => x),
      []
    );

  let count = 0;
  for (const sourceUrl of sourceUrls) {
    for (const body of sourceBodys)
      try {
        topic("POST " + sourceUrl, { body: body });
        const elements = reader.itemSelector(
          await postForm<T[]>(sourceUrl, body)
        );

        count += elements.length;
        for (const e of elements) {
          try {
            if (!reader.sourceDetailUrl)
              await transformPersist(persist, reader, reader.mapper(e));
            else {
              const detailUrl = reader.sourceDetailUrl(e);

              topic("GET " + detailUrl);
              const body = await getHtml(detailUrl);

              if (!body) {
                console.error("body is null on GET " + detailUrl);
                return;
              }

              const $ = cheerio.load(body);
              await transformPersist(
                persist,
                reader,
                reader.mapper(e, $("body"))
              );
            }
          } catch (err) {
            const now = moment();
            const error = {
              titel: "Error in " + reader.sourceName,
              beschreibung: `${err}\n${inspect(e)}\n${sourceUrl}`,
              kategorie: "Error",
              start: now,
              quelle: reader.sourceName,
              createdAt: now
            };
            topic("Error", error);
            await persist(error);
          }
        }
      } catch (err) {
        const now = moment();
        const error = {
          titel: "Error in " + reader.sourceName,
          beschreibung: `${err}\n${sourceUrl}`,
          kategorie: "Error",
          start: now,
          quelle: reader.sourceName,
          createdAt: now
        };
        topic("Error", error);
        await persist(error);
      }
  }
  if (count === 0) {
    const now = moment();
    const error = {
      titel: "Error in " + reader.sourceName,
      beschreibung: `Keine Events gefunden`,
      kategorie: "Error",
      start: now,
      quelle: reader.sourceName,
      createdAt: now
    };
    topic("Error", error);
    await persist(error);
  }
}

async function crawelJson<T>(
  reader: JsonReader<any, any>,
  persist: (event: Calendar.Event) => Promise<void>
) {
  topic(reader.sourceName);
  const sourceUrls = reader.sourceUrl
    .map(u => params(u))
    .reduce(
      selectMany((x: any) => x),
      []
    );

  let count = 0;
  for (const sourceUrl of sourceUrls) {
    try {
      topic("GET " + sourceUrl);
      const elements = reader.itemSelector(await getJson<T[]>(sourceUrl));

      count += elements.length;
      for (const e of elements) {
        try {
          if (!reader.sourceDetailUrl)
            await transformPersist(persist, reader, reader.mapper(e));
          else {
            const detailUrl = reader.sourceDetailUrl(e);

            topic("GET " + detailUrl);
            const body = await getHtml(detailUrl);

            if (!body) {
              console.error("body is null on GET " + detailUrl);
              return;
            }

            topic(body);
            const $ = cheerio.load(body);
            await transformPersist(
              persist,
              reader,
              reader.mapper(e, $("body"))
            );
          }
        } catch (err) {
          const now = moment();
          const error = {
            titel: "Error in " + reader.sourceName,
            beschreibung: `${err}\n${inspect(e)}\n${sourceUrl}`,
            kategorie: "Error",
            start: now,
            quelle: reader.sourceName,
            createdAt: now
          };
          topic("Error", error);
          await persist(error);
        }
      }
    } catch (err) {
      const now = moment();
      const error = {
        titel: "Error in " + reader.sourceName,
        beschreibung: `${err}\n${sourceUrl}`,
        kategorie: "Error",
        start: now,
        quelle: reader.sourceName,
        createdAt: now
      };
      topic("Error", error);
      await persist(error);
    }
  }
  if (count === 0) {
    const now = moment();
    const error = {
      titel: "Error in " + reader.sourceName,
      beschreibung: `Keine Events gefunden`,
      kategorie: "Error",
      start: now,
      quelle: reader.sourceName,
      createdAt: now
    };
    topic("Error", error);
    await persist(error);
  }
}
async function crawelStatic(
  reader: StaticReader,
  persist: (event: Calendar.Event) => Promise<void>
) {
  transformPersist(persist, reader, reader.get());
}

async function transformPersist(
  persist: (event: Calendar.Event) => Promise<void>,
  reader: Reader,
  readerEvents: Event[]
) {
  for (const readerEvent of readerEvents) {
    const now = moment();
    const inAWeek = moment().add(7, "days");

    if ((readerEvent.ende || readerEvent.start).isBefore(now, "day")) {
      return;
    }

    if (readerEvent.start.isAfter(inAWeek, "day")) {
      return;
    }

    if (readerEvent.start.isBefore(now, "day")) {
      readerEvent.start = moment({
        years: now.year(),
        months: now.month(),
        date: now.date(),
        hours: readerEvent.start.hours(),
        minutes: readerEvent.start.minutes()
      });
    }

    if (readerEvent.ende && readerEvent.ende.isAfter(inAWeek, "day")) {
      readerEvent.ende = moment({
        years: inAWeek.year(),
        months: inAWeek.month(),
        date: inAWeek.date(),
        hours: readerEvent.ende.hours(),
        minutes: readerEvent.ende.minutes()
      });
    }

    if (readerEvent.kategorie)
      readerEvent.kategorie = readerEvent.kategorie
        .replace(/\s+/gi, " ")
        .trim();
    readerEvent.titel = (readerEvent.titel || "").replace(/\s+/gi, " ").trim();
    if (readerEvent.beschreibung)
      readerEvent.beschreibung = readerEvent.beschreibung
        .replace(/\s+/gi, " ")
        .trim();
    if (readerEvent.ort)
      readerEvent.ort = readerEvent.ort
        .split("\n")
        .map(z => z.replace(/\s+/gi, " ").trim())
        .filter(z => z)
        .join(", ");

    // enrich
    const calenderEvent: Calendar.Event = {
      ...readerEvent,
      quelle: reader.sourceName,
      createdAt: now
    };

    await persist(calenderEvent);
  }
}
