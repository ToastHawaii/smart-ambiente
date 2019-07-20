import { getJson } from "../../utils";
import * as moment from "moment";

interface Event {
  basisKategorie: string;
  kategorie?: string;
  titel: string;
  bild?: string;
  start: moment.Moment;
  ende: moment.Moment;
}

moment.locale("de");

function convertToEvent(event: Event): TileEvent {
  const color = textToColor(event.basisKategorie);
  let datum = `${moment(event.start).format("MMM")} - ${moment(event.ende).format("MMM")}`;

  return {
    icon: event.basisKategorie,
    hintergrundFarbe:
      "rgba(" + color.r + "," + color.g + "," + color.b + ", 0.85)",
    textFarbe:
      /*(color.r * 0.299 + color.g * 0.587 + color.b * 0.114) > 186 ? "#000000" :*/ "#ffffff",
    titel: event.titel,
    bild: event.bild,
    datum: datum
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
  hintergrundFarbe: string;
  textFarbe: string;
  titel: string;
  datum: string;
  bild?: string;
}

class SaisonRepository {
  public constructor() { }

  private events: TileEvent[];

  public async load() {
    const data = await getJson("/api/saison");
    this.events = this.shuffle(data.map((e: any) => convertToEvent(e)));
  }

  public async get() {
    await this.load();
    const count =
      Math.floor((window.innerWidth - 10) / 190) *
      Math.ceil((window.innerHeight - 10) / 190);

    return count <= this.events.length ? this.events.splice(0, count) : this.events;
  }

  public switch(ev: TileEvent) {
    this.events.push(ev);
    return this.events.splice(0, 1)[0];
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
}

export const saisonRepository = new SaisonRepository();
