import * as request from "request";
import { zuerichUnbezahlbarReader } from "./ZuerichUnbezahlbarReader";
import { stadtZuerichChReader } from "./StadtZuerichChReader";
import { eventsChReader } from "./EventsChReader";
import { tagesanzeigerChReader } from "./TagesanzeigerReader";
import { zuriNetReader } from "./ZuriNetReader";
import { comedyHausReader } from "./ComedyHausReader";
import { pfirsiReader } from "./PfirsiReader";
import * as Calendar from "./Calendar";
import * as moment from "moment";
import * as cheerio from "cheerio";

export interface Event {
  kategorie?: string;
  titel: string;
  beschreibung?: string;
  bild?: string;
  start: moment.Moment;
  ende?: moment.Moment;
  ort?: string;
}

export interface Reader {
  sourceName: string;
  sourceUrl: string[];
  itemSelector: string;
  sourceDetailUrl?: ($listItem: Cheerio) => string;
  mapper: ($listItem: Cheerio, $detailItem?: Cheerio) => Event[];
}

const readers: Reader[] = [
  stadtZuerichChReader,
  zuerichUnbezahlbarReader,
  eventsChReader,
  tagesanzeigerChReader,
  zuriNetReader,
  comedyHausReader,
  pfirsiReader
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

function httpGet(sourceUrl: string) {
  return new Promise<string>(resolve =>
    request.get(
      {
        url: sourceUrl,
        headers: { "User-Agent": "request" }
      },
      (err, _res, body) => {
        if (err) console.info("error on request: " + err);
        resolve(body);
      }
    )
  );
}

export async function crawel(
  persist: (event: Calendar.Event) => Promise<void>
) {
  for (const reader of readers) {
    // console.info(reader.sourceName);
    const sourceUrls = reader.sourceUrl
      .map(u => urls(u))
      .reduce(selectMany((x: any) => x), []);

    for (const sourceUrl of sourceUrls) {
      // console.info("GET " + sourceUrl);

      let body = await httpGet(sourceUrl);

      // console.info(body);
      const $ = cheerio.load(body);

      const elements: Cheerio[] = [];
      $(reader.itemSelector).each((_i, e) => {
        elements.push($(e));
      });

      for (const $e of elements) {
        if (!reader.sourceDetailUrl)
          await transformPersist(persist, reader, $e);
        else {
          const detailUrl = reader.sourceDetailUrl($e);

          // console.info("GET " + detailUrl);
          body = await httpGet(detailUrl);

          if (!body) {
            console.info("body is null on GET " + detailUrl);
            return;
          }
          //    console.info(body);
          const $ = cheerio.load(body);
          await transformPersist(persist, reader, $e, $("body"));
        }
      }
    }
  }
}

// function sub(beschreibung: string) {
//   beschreibung = beschreibung.replace(/\s\s+/g, " ").trim();
//   return beschreibung.length > 35
//     ? beschreibung.substring(0, 32) + "..."
//     : beschreibung;
// }

async function transformPersist(
  persist: (event: Calendar.Event) => Promise<void>,
  reader: Reader,
  $listItem: Cheerio,
  $detailItem?: Cheerio
) {
  try {
    // transform
    const readerEvents = reader.mapper($listItem, $detailItem);

    // for (const readerEvent of readerEvents) {
    // console.info(
    //   [
    //     readerEvent.titel,
    //     readerEvent.beschreibung,
    //     readerEvent.kategorie,
    //     readerEvent.ort,
    //     readerEvent.bild,
    //     readerEvent.start.format(),
    //     readerEvent.ende ? readerEvent.ende.format() : ""
    //   ]
    //     .map(f => sub(f + "").replace(/(?:\r\n|\r|\n)/g, ""))
    //     .join(";")
    // );
    //}

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
          .replace(/\s+/g, " ")
          .trim();
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
        quelle: reader.sourceName
      };

      await persist(calenderEvent);
    }
  } catch (err) {
    console.info("error: " + err);
  }
}
