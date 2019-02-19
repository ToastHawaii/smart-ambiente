import { getJson } from "../../utils";
import * as moment from "moment";

interface Event {
  basisKategorie: string;
  kategorie?: string;
  titel: string;
  beschreibung?: string;
  bild?: string;
  start: moment.Moment;
  ende?: moment.Moment;
  ort?: string;
  quelle: string;
}

moment.locale("de");

function convertToEvent(event: Event): TileEvent {
  const color = textToColor(event.basisKategorie);
  const beschreibung = event.beschreibung || "";
  let datum = moment(event.start).calendar(undefined, {
    sameDay: "[heute]",
    nextDay: "[morgen]",
    nextWeek: "dd",
    sameElse: "Do MMM"
  });

  if (event.ende) {
    const endDatum = moment(event.ende).calendar(undefined, {
      sameDay: "[heute]",
      nextDay: "[morgen]",
      nextWeek: "dd",
      sameElse: "Do MMM"
    });
    if (endDatum !== datum) datum += " - " + endDatum;
  }

  let zeit = moment(event.start).format("LT");

  if (event.ende) {
    const endZeit = moment(event.ende).format("LT");
    if (endZeit !== zeit) zeit += " - " + endZeit;
  }

  return {
    kategorie: event.kategorie || "",
    icon: event.basisKategorie,
    hintergrundFarbe:
      "rgba(" + color.r + "," + color.g + "," + color.b + ", 0.85)",
    textFarbe:
      /*(color.r * 0.299 + color.g * 0.587 + color.b * 0.114) > 186 ? "#000000" :*/ "#ffffff",
    titel: event.titel,
    datum: datum,
    zeit: zeit,
    ort: event.ort || "",
    bild: event.bild,
    beschreibung:
      beschreibung.length > 250
        ? beschreibung.substring(0, 247) + "..."
        : beschreibung,
    quelle: event.quelle || "",
    groesse: beschreibung.length > 100 ? 2 : 1,
    hatDetails:
      (beschreibung.replace(/ /g, "").length > 0 &&
        beschreibung.replace(/ /g, "") !== event.titel.replace(/ /g, "")) ||
      !!event.bild
  };
}

function textToColor(s: string) {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < s.length; i++) {
    if (i % 3 === 0) r = (r + s.charCodeAt(i)) % 256;
    else if (i % 3 === 1) g = (g + s.charCodeAt(i)) % 256;
    else b = (b + s.charCodeAt(i)) % 256;
  }
  return { r, g, b };
}

export interface TileEvent {
  icon: string;
  kategorie?: string;
  hintergrundFarbe: string;
  textFarbe: string;
  titel: string;
  datum: string;
  zeit: string;
  ort?: string;
  bild?: string;
  beschreibung?: string;
  quelle?: string;
  groesse: 1 | 2;
  hatDetails: boolean;
}

class EventsRepository {
  public constructor() {}

  private events: TileEvent[];

  public async load() {
    const data = await getJson("/api/events");
    this.events = this.normalize(
      this.shuffle(data.map((e: any) => convertToEvent(e))),
      Math.floor((window.innerWidth - 10) / 190)
    );
  }

  public async get() {
    await this.load();
    let i = 1;
    const count =
      Math.floor((window.innerWidth - 10) / 190) *
      Math.ceil((window.innerHeight - 10) / 190);
    let summe = 0;
    for (const ev of this.events) {
      summe += ev.groesse;
      if (count <= summe) break;
      i++;
    }

    return this.events.splice(0, i);
  }

  public switch(ev: TileEvent) {
    this.events.push(ev);
    const nextIndex = this.events.findIndex(e => e.groesse === ev.groesse);
    return this.events.splice(nextIndex, 1)[0];
  }

  private shuffle<T>(array: T[]) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  private normalize<T extends { groesse: number }>(events: T[], size: number) {
    let places = 0;
    for (let i = 0; i < events.length; i++) {
      const e1 = events[i];
      if (places + e1.groesse <= size) {
        places = (places + e1.groesse) % size;
        continue;
      }

      for (let ii = events.length - 1; ii > i; ii--) {
        const e2 = events[ii];
        if (places + e2.groesse <= size) {
          events[i] = e2;
          events[ii] = e1;
          places = (places + e2.groesse) % size;
          break;
        }
      }
    }
    return events;
  }
}

export const eventsRepository = new EventsRepository();
