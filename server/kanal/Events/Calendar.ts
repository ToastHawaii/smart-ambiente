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
  topic(`create: ${e.titel} ${e.start} - ${e.ende}`);
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
    try {
      const id = (e.titel + e.start.toISOString()).replace(/[^a-z0-9]/gi, "");
      e.basisKategorie = extractBaseKategorie(e);

      if (
        kategorie &&
        !e.basisKategorie.toUpperCase().includes(kategorie.toUpperCase())
      )
        continue;

      const allDay = isAllDay(e);

      const calEvent = cal.createEvent({
        uid: id,
        summary: e.titel,
        start: !allDay ? e.start : moment(e.start).add(3, "hour"),
        end: !allDay
          ? e.ende
          : e.ende && !e.start.isSame(e.ende, "day")
          ? moment(e.ende).add(3, "hour")
          : undefined,
        allDay: allDay,
        description: e.beschreibung || undefined,
        location: e.ort || undefined,
        url: e.bild || undefined,
        stamp: e.createdAt
      });

      const categories: { name: string }[] = [];

      categories.push({ name: e.basisKategorie });
      if (e.kategorie) categories.push({ name: e.kategorie });
      calEvent.categories(categories);
    } catch (error) {
      topic("error: " + error, {
        summary: e.titel,
        start: e.start,
        end: e.ende,
        allDay: isAllDay(e),
        description: e.beschreibung || undefined,
        location: e.ort || undefined,
        url: e.bild || undefined,
        stamp: e.createdAt
      });
    }
  }

  return cal.toString();
}
// dav.debug.enabled = true;

 if (args["--RELEASE"]) {
init();
 }

async function init() {
  if (args["--RELEASE"]) await delay(5 * 60 * 1000);

  try {
    topic("Crawel");
    Crawler.crawel(async event => {
      if (shouldBeIgnored(event)) {
        topic("filtered " + event.titel);
        return;
      }

      const existings = events.filter(e => textIsEquals(e.titel, event.titel));
      if (existings.length > 0)
        topic(
          "existings: ",
          existings.map(e => `${e.titel} ${e.start} - ${e.ende}`)
        );
      if (existings.length === 0) {
        await persist(event);
        return;
      }

      for (const e of existings) {
        supplement(e, event);
      }

      const same = existings.filter(e => isBetween(event, e));
      if (same.length > 0)
        topic(
          "same: ",
          same.map(e => `${e.titel} ${e.start} - ${e.ende}`)
        );
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
  return s.replace(/[^a-z0-9]/gi, "").toUpperCase();
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
    "über den tod reden",
    "titel der veranstaltung",
    "audiowalk für kinder",
    "indoor spielplatz",
    " 45+ ",
    " 50+ ",
    " 55+ ",
    " 60+ ",
    " 65+ ",
    "deutschkurs",
    "deutsch kurs",
    "mädelsflohmarkt",
    "seniorentreff",
    "vater-kind-treff"
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

  return (
    (!e1.ende && !e2.ende && e1.start.isSame(e2.start, "minutes")) ||
    (e1.start.isBetween(e2.start, e2Ende, "minutes", "[]") &&
      (!e1Ende || e1Ende.isBetween(e2.start, e2Ende, "minutes", "[]")))
  );
}

function isAllDay(e: { start: moment.Moment; ende?: moment.Moment }) {
  return (
    e.start.hour() === 0 &&
    (e.start.minute() === 0 || e.start.minute() === 1) &&
    (!e.ende || (e.ende.hour() === 23 && e.ende.minute() === 59))
  );
}

const baseKategorieSchlagwoerter = [
  {
    name: "Leichtigkeit",
    schlagwoerter: [
      "comedy",
      "kabarett",
      "poetry-slam",
      "poetry slam",
      "poetryslam",
      "witz",
      "humor",
      "komödie",
      "theatersport",
      "satire",
      "clown",
      "lachen"
    ]
  },
  {
    name: "Leichtigkeit",
    schlagwoerter: [
      "leichtigkeit",
      "spiel",
      "spass",
      "freude",
      "humor",
      "lebendigkeit",
      "bequemlichkeit",
      "erholung",
      "gelassenheit",
      "gemütlichkeit",
      "leicht",
      "lebendig",
      "bequem",
      "gelassen",
      "gemütlich"
    ]
  },
  {
    name: "Gerechtigkeit",
    schlagwoerter: [
      "gerechtigkeit",
      "gleichwertigkeit",
      "gleichbehandlung",
      "privatsphäre",
      "gerecht",
      "gleichwertig",
      "privat"
    ]
  },
  {
    name: "Balance",
    schlagwoerter: [
      "balance",
      "gleichgewicht",
      "gleichwertigkeit",
      "gegenseitigkeit",
      "ausgewogenheit",
      "ausgeglichenheit",
      "ausgleich",
      "achtsamkeit",
      "beständigkeit",
      "gegenseitig",
      "ausgewogen",
      "ausgeglichen",
      "achtsamkeit",
      "beständig"
    ]
  },
  {
    name: "Unterstützung",
    schlagwoerter: [
      "unterstützung",
      "hilfe",
      "fürsorge",
      "rückhalt",
      "zusammenarbeit",
      "zuspruch",
      "ermutigung",
      "diskretion",
      "geborgenheit",
      "verbindlichkeit",
      "orientierung",
      "geborgen",
      "verbindlich"
    ]
  },
  {
    name: "Dazugehören",
    schlagwoerter: [
      "dazugehören",
      "verständnis",
      "gemeinschaft",
      "einbezogen sein",
      "eigenen platz haben",
      "aufrichtigkeit",
      "ehrlichkeit",
      "vertraulichkeit",
      "vertrauen",
      "klarheit",
      "nähe",
      "intimität",
      "akzeptanz",
      "aufmerksamkeit",
      "aufrichtig",
      "ehrlich",
      "vertaulich",
      "aufmerksam"
    ]
  },
  {
    name: "Wertschätzung",
    schlagwoerter: [
      "wertschätzung",
      "anerkennung",
      "bewunderung",
      "dankbarkeit",
      "bestätigung",
      "respekt",
      "einfühlung",
      "verlässlichkeit",
      "transparenz",
      "dankbar",
      "verlässlich"
    ]
  },
  {
    name: "Austausch",
    schlagwoerter: [
      "austausch",
      "verständnis",
      "verständigung",
      "kommunikation",
      "wahrgenommen werden",
      "sex",
      "tiefe",
      "kontakt"
    ]
  },
  {
    name: "Beitragen",
    schlagwoerter: ["sinnhaftigkeit", "authentizität", "authentisch"]
  },
  {
    name: "Entwicklung",
    schlagwoerter: [
      "entwicklung",
      "anregung",
      "inspiration",
      "selbstentfaltung",
      "entfaltung",
      "lernen",
      "verbesserung",
      "wachstum",
      "individualität",
      "unabhängigkeit",
      "unabhängig"
    ]
  },
  {
    name: "Wirksam sein",
    schlagwoerter: [
      "wirksam sein",
      "selbstwirksamkeit",
      "effektivität",
      "kompetenz",
      "erfolg",
      "autonomie",
      "freiwilligkeit",
      "selbstwirksam",
      "freiwillig"
    ]
  },
  {
    name: "Abwechslung",
    schlagwoerter: ["abwechslung", "vielfalt", "abenteuer", "unterhaltung"]
  },
  {
    name: "Schönheit",
    schlagwoerter: [
      "schönheit",
      "ästhetik",
      "harmonie",
      "ordnung",
      "ruhe",
      "frieden",
      "stille",
      "rückzug",
      "schön"
    ]
  },
  {
    name: "Abwechslung",
    schlagwoerter: [
      "film",
      "kino",
      "einkaufen",
      "markt",
      "shop",
      "börse",
      "märkte",
      "börsen",
      "führung"
    ]
  },
  {
    name: "Balance",
    schlagwoerter: ["bewegung", "sport", "fitness", "tanz", "yoga", "dance"]
  },
  {
    name: "Unterstützung",
    schlagwoerter: [
      "stammtisch",
      "beratung",
      "offenen werkstatt",
      "offene werkstatt",
      "offene werkstatt",
      "repair café"
    ]
  },
  {
    name: "Austausch",
    schlagwoerter: ["erfahrungsaustausch", "zusammenarbeit", "networking"]
  },
  {
    name: "Entwicklung",
    schlagwoerter: [
      "vortrag",
      "informationsveranstaltung",
      "infoanlass",
      "bildung",
      "informationsabend",
      "wissen",
      "technologie",
      "softwareentwicklung",
      "programmieren",
      "weiterentwicklung"
    ]
  },
  {
    name: "Balance",
    schlagwoerter: ["traning", "marathon"]
  },
  {
    name: "Abwechslung",
    schlagwoerter: ["theater", "zirkus", "musical", "oper"]
  },
  {
    name: "Austausch",
    schlagwoerter: [
      "party",
      "fest",
      "disco",
      "club",
      "festival",
      "messe",
      "sozial",
      "game",
      "spiele"
    ]
  },
  {
    name: "Entwicklung",
    schlagwoerter: ["ausstellung", "museum", "museen"]
  },
  {
    name: "Schönheit",
    schlagwoerter: [
      "kunst",
      "fotografie",
      "musik",
      "musig",
      "konzert",
      "jazz",
      "melodien",
      "band",
      "album",
      "rock",
      "pop",
      "hip-hop",
      "hip hop",
      "music"
    ]
  },
  {
    name: "Wertschätzung",
    schlagwoerter: ["single", "freund"]
  },
  {
    name: "Abwechslung",
    schlagwoerter: [
      "essen",
      "fleisch",
      "brunch",
      "café",
      "restaurant",
      "fundue",
      "degustation",
      "zmorge",
      "zmittag",
      "food"
    ]
  },
  { name: "Balance", schlagwoerter: ["tier", "natur", "garten", "zoo"] },
  {
    name: "Entwicklung",
    schlagwoerter: [
      "zeichnen",
      "werken",
      "gestalten",
      "workshop",
      "photoshop",
      "lesung",
      "literatur",
      "sprache"
    ]
  },
  {
    name: "Schönheit",
    schlagwoerter: ["gedichte", "lyrik"]
  },
  {
    name: "Austausch",
    schlagwoerter: ["konversation", "englisch", "conversation"]
  },
  {
    name: "Austausch",
    schlagwoerter: ["diskussion", "discussion"]
  },
  {
    name: "Beitragen",
    schlagwoerter: [
      "beitragen",
      "sinn",
      "kreativität",
      "dienen",
      "geben",
      "helf"
    ]
  },
  {
    name: "Entwicklung",
    schlagwoerter: ["wissen", "sinn", "freiheit", "frei"]
  },
  {
    name: "Wertschätzung",
    schlagwoerter: ["dating", "date", "beziehung"]
  },
  {
    name: "Dazugehören",
    schlagwoerter: ["verein", "gruppe", "klar"]
  },
  {
    name: "Leichtigkeit",
    schlagwoerter: ["impro", "fun"]
  },
  {
    name: "Abwechslung",
    schlagwoerter: ["bar", "show"]
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
  if (text)
    for (const k of baseKategorieSchlagwoerter) {
      for (const s of k.schlagwoerter) {
        if (text.toUpperCase().indexOf(s.toUpperCase()) >= 0) return k.name;
      }
    }
  return undefined;
}
