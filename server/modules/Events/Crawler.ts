import { zuerichUnbezahlbarReader } from "./ZuerichUnbezahlbarReader";
import { stadtZuerichChReader } from "./StadtZuerichChReader";
import { eventsChReader } from "./EventsChReader";
import { tagesanzeigerChReader } from "./TagesanzeigerReader";
import { zuriNetReader } from "./ZuriNetReader";
import { comedyHausReader } from "./ComedyHausReader";
import { pfirsiReader } from "./PfirsiReader";
import { casinotheaterReader } from "./CasinotheaterReader";
import { dynamoReader } from "./DynamoReader";
import * as Calendar from "./Calendar";
import * as moment from "moment";
import * as cheerio from "cheerio";
import { getHtml, getJson } from "../../utils/request";
import debug from "../../utils/debug";
import { inspect } from "util";
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

type Reader = HtmlReader | JsonReader<any, any>;

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

const readers: Reader[] = [
  stadtZuerichChReader,
  zuerichUnbezahlbarReader,
  eventsChReader,
  tagesanzeigerChReader,
  zuriNetReader,
  comedyHausReader,
  pfirsiReader,
  casinotheaterReader,
  dynamoReader
];

function urls(url: string): string[] {
  if (url.indexOf("[") === -1) return [url];

  const urls: string[] = [];
  let day = moment();
  for (let i = 0; i < 8; i++) {
    urls.push(day.format(url));
    day = day.add(1, "day");
  }

  return urls;
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
    else await crawelJson(reader, persist);
  }
}

async function crawelHtml(
  reader: HtmlReader,
  persist: (event: Calendar.Event) => Promise<void>
) {
  topic(reader.sourceName);
  const sourceUrls = reader.sourceUrl
    .map(u => urls(u))
    .reduce(selectMany((x: any) => x), []);

  for (const sourceUrl of sourceUrls) {
    try {
      topic("GET " + sourceUrl);
      let body = await getHtml(sourceUrl);

      const $ = cheerio.load(body);

      const elements: Cheerio[] = [];
      $(reader.itemSelector).each((_i, e) => {
        elements.push($(e));
      });

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
}

async function crawelJson<T>(
  reader: JsonReader<any, any>,
  persist: (event: Calendar.Event) => Promise<void>
) {
  topic(reader.sourceName);
  const sourceUrls = reader.sourceUrl
    .map(u => urls(u))
    .reduce(selectMany((x: any) => x), []);

  for (const sourceUrl of sourceUrls) {
    try {
      topic("GET " + sourceUrl);
      const elements = reader.itemSelector(await getJson<T[]>(sourceUrl));

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
          await persist({
            titel: "Error in " + reader.sourceName,
            beschreibung: `${err}\n${inspect(e)}\n${sourceUrl}`,
            kategorie: "Error",
            start: now,
            quelle: reader.sourceName,
            createdAt: now
          });
        }
      }
    } catch (err) {
      const now = moment();
      await persist({
        titel: "Error in " + reader.sourceName,
        beschreibung: `${err}\n${sourceUrl}`,
        kategorie: "Error",
        start: now,
        quelle: reader.sourceName,
        createdAt: now
      });
    }
  }
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
      readerEvent.kategorie = readerEvent.kategorie.replace(/\s+/g, " ").trim();
    readerEvent.titel = (readerEvent.titel || "").replace(/\s+/g, " ").trim();
    if (readerEvent.beschreibung)
      readerEvent.beschreibung = readerEvent.beschreibung
        .replace(/\s+/g, " ")
        .trim();
    if (readerEvent.ort)
      readerEvent.ort = readerEvent.ort
        .split("\n")
        .map(z => z.replace(/\s+/g, " ").trim())
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
