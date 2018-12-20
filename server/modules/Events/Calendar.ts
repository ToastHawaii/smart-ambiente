import * as regeneratorRuntime from "regenerator-runtime";
(global as any).regeneratorRuntime = regeneratorRuntime;
import * as icalGenerator from "ical-generator";
import * as moment from "moment";
import * as Crawler from "./Crawler";
import { delay } from "../../utils/timer";
import { args } from "../../utils/arguments";
import debug from "../../utils/debug";
const topic = debug("Calendar", false);

export interface Event {
  basisKategorie?: string;
  kategorie?: string;
  titel: string;
  beschreibung?: string;
  bild?: string;
  start: moment.Moment;
  ende?: moment.Moment;
  ort?: string;
  quelle: string;
  createdAt: moment.Moment;
}

const events: Event[] = [];

function persist(e: Event) {
  e.basisKategorie = extractBaseKategorie(e);
  topic("create: " + e.titel);
  events.push(e);
}

export function get() {
  const uniqueEvents: Event[] = [];
  for (const ev of events.sort((left, right) => left.start.diff(right.start))) {
    if (uniqueEvents.some(e => textIsEquals(ev.titel, e.titel))) continue;
    uniqueEvents.push(ev);
  }

  return uniqueEvents;
}

export function getIcal(kategorie: string = "") {
  const cal = icalGenerator();
  cal.domain("smart-ambiente");
  cal.prodId("//davical.org//NONSGML AWL Calendar//EN");

  for (const e of events) {
    const id = (e.titel + e.start.toISOString()).replace(/[^a-z0-9]/g, "");
    e.basisKategorie = extractBaseKategorie(e);

    if (!e.basisKategorie.toUpperCase().includes(kategorie.toUpperCase()))
      continue;

    const calEvent = cal.createEvent({
      uid: id,
      summary: e.titel,
      start: e.start,
      end: e.ende,
      allDay: isAllDay(e),
      description: e.beschreibung || undefined,
      location: e.ort || undefined,
      url: e.bild || undefined,
      stamp: e.createdAt
    });

    const categories: { name: string }[] = [];

    categories.push({ name: e.basisKategorie });
    if (e.kategorie) categories.push({ name: e.kategorie });
    calEvent.categories(categories);
  }

  return cal.toString();
}
// dav.debug.enabled = true;

if (args["--RELEASE"]) {
  init();
}
init();

async function init() {
  await delay(30 * 1000);

  try {
    topic("Crawel");
    Crawler.crawel(async event => {
      if (shouldBeIgnored(event)) {
        topic("filtered " + event.titel);
        return;
      }

      const existings = events.filter(e => textIsEquals(e.titel, event.titel));
      if (existings.length > 0)
        topic("existings: ", existings.map(e => e.titel));
      if (existings.length === 0) {
        await persist(event);
        return;
      }

      for (const e of existings) {
        supplement(e, event);
      }

      const same = existings.filter(e => isBetween(event, e));
      if (same.length > 0) topic("same: ", same.map(e => e.titel));
      for (const e of same) {
        e.start = event.start;
        e.ende = event.ende;
      }

      if (
        same.length === 0 &&
        existings.filter(e => isBetween(e, event)).length === 0
      ) {
        await persist(event);
      }
    });
  } catch (error) {
    topic("error: " + error);
  }
}

function supplement(ev1: Event, ev2: Event): Event {
  if (shouldUseSecond(ev1.kategorie, ev2.kategorie)) {
    ev1.kategorie = ev2.kategorie;
  }
  if (shouldUseSecond(ev1.titel, ev2.titel)) {
    ev1.titel = ev2.titel;
  }
  if (shouldUseSecond(ev1.beschreibung, ev2.beschreibung)) {
    ev1.beschreibung = ev2.beschreibung;
  }
  if (shouldUseSecond(ev1.ort, ev2.ort)) {
    ev1.ort = ev2.ort;
  }
  if (!ev1.bild && ev2.bild) {
    ev1.bild = ev1.bild || ev2.bild;
  }

  return ev1;
}

function shouldUseSecond(s1: string | undefined, s2: string | undefined) {
  if (!s2) return false;

  if (!s1) return true;

  if (textSimplify(s1).length >= textSimplify(s2).length) return false;

  return true;
}

function textIsEquals(s1: string | undefined, s2: string | undefined) {
  return textSimplify(s1) === textSimplify(s2);
}

function textSimplify(s: string | undefined) {
  if (!s) return "";
  return s.replace(/[^a-z0-9]/g, "");
}

function shouldBeIgnored(event: { titel: string; beschreibung?: string }) {
  return [
    "evian",
    "rivella",
    "skateranlage",
    "freestyleanlage",
    "sportkurse für schüler",
    "bike-park",
    "gottesdienst",
    "jugendberatung",
    "beratungsstelle für kinder",
    "trauer-stammtisch",
    "fragen zur lehre",
    "über den tod reden"
  ].some(
    f =>
      event.titel.toUpperCase().indexOf(f.toUpperCase()) > -1 ||
      (!!event.beschreibung &&
        event.beschreibung.toUpperCase().indexOf(f.toUpperCase()) > -1)
  );
}
moment.locale("de");
function isBetween(
  e1: { start: moment.Moment; ende?: moment.Moment },
  e2: { start: moment.Moment; ende?: moment.Moment }
) {
  let e1Ende = e1.ende;
  if (!e1Ende && isAllDay(e1)) e1Ende = e1.start.endOf("day");

  let e2Ende = e2.ende;
  if (!e2Ende && isAllDay(e2)) e2Ende = e2.start.endOf("day");
  // console.info(
  //   (e1.start.isBetween(e2.start, e2Ende, "minutes", "[]") &&
  //     (!e1Ende || e1Ende.isBetween(e2.start, e2Ende, "minutes", "[]"))) +
  //     " e1: " +
  //     e1.start.format("DD HH") +
  //     (e1Ende ? " - " + e1Ende.format("DD HH") : "") +
  //     " e2: " +
  //     e2.start.format("DD HH") +
  //     (e2Ende ? " - " + e2Ende.format("DD HH") : "")
  // );
  return (
    e1.start.isBetween(e2.start, e2Ende, "minutes", "[]") &&
    (!e1Ende || e1Ende.isBetween(e2.start, e2Ende, "minutes", "[]"))
  );
}

function isAllDay(e: { start: moment.Moment; ende?: moment.Moment }) {
  return (
    e.start.hour() === 0 &&
    e.start.minute() === 0 &&
    (!e.ende || (e.ende.hour() === 23 && e.ende.minute() === 59))
  );
}

const baseKategorieSchlagwoerter = [
  { name: "Film", schlagwoerter: ["film", "kino"] },
  { name: "Einkaufen", schlagwoerter: ["markt"] },
  { name: "Theater", schlagwoerter: ["theater", "zirkus"] },
  { name: "Führung", schlagwoerter: ["führung"] },
  {
    name: "Bildung",
    schlagwoerter: [
      "lesung",
      "vortrag",
      "erfahrungsaustausch",
      "informationsveranstaltung",
      "infoanlass",
      "stammtisch",
      "bildung",
      "informationsabend"
    ]
  },
  { name: "Bewegung", schlagwoerter: ["sport", "fitness", "traning"] },
  { name: "Festival", schlagwoerter: ["festival", "messe"] },
  { name: "Party", schlagwoerter: ["party", "fest"] },
  {
    name: "Ausstellung",
    schlagwoerter: ["ausstellung", "museum", "museen", "kunst"]
  },
  {
    name: "Comedy",
    schlagwoerter: [
      "comedy",
      "kabarett",
      "poetry-slam",
      "poetry slam",
      "poetryslam"
    ]
  },
  {
    name: "Musik",
    schlagwoerter: ["musik", "konzert", "tanz", "jazz", "melodien"]
  },
  {
    name: "Essen",
    schlagwoerter: ["essen", "fleisch", "brunch", "café", "restaurant"]
  },
  {
    name: "Error",
    schlagwoerter: ["error"]
  }
];

function extractBaseKategorie(e: {
  kategorie?: string;
  titel: string;
  beschreibung?: string;
}) {
  let result: string | undefined;
  if (e.kategorie) {
    // von kategorie
    result = findBaseKategorie(e.kategorie);
    if (result) return result;
  }

  // von titel
  result = findBaseKategorie(e.titel);
  if (result) return result;

  if (e.beschreibung) {
    // von beschreibung
    result = findBaseKategorie(e.beschreibung);
    if (result) return result;
  }

  return "Andere";
}

function findBaseKategorie(text: string) {
  for (const k of baseKategorieSchlagwoerter) {
    for (const s of k.schlagwoerter) {
      if (text.toUpperCase().indexOf(s.toUpperCase()) >= 0) return k.name;
    }
  }
  return undefined;
}
