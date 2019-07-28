import * as moment from "moment";
import { data } from "./Data";

interface Saison {
  basisKategorie: string;
  kategorie?: string;
  titel: string;
  beschreibung?: string;
  bild?: string;
  start: moment.Moment;
  ende: moment.Moment;
}

moment.locale("de");

function convertToSaison(saison: Saison): TileSaison {
  const color = textToColor(saison.basisKategorie);
  const beschreibung = saison.beschreibung || "";
  let datum = `${moment(saison.start).format("MMM")} - ${moment(saison.ende).format("MMM")}`;

  return {
    icon: saison.basisKategorie,
    hintergrundFarbe:
      "rgba(" + color.r + "," + color.g + "," + color.b + ", 0.85)",
    textFarbe:
      /*(color.r * 0.299 + color.g * 0.587 + color.b * 0.114) > 186 ? "#000000" :*/ "#ffffff",
    titel: saison.titel,
    datum: datum,
    bild: saison.bild,
    beschreibung:
      beschreibung.length > 250
        ? beschreibung.substring(0, 247) + "..."
        : beschreibung,
    groesse: beschreibung.length > 100 ? 2 : 1,
    hatDetails:
      (beschreibung.replace(/ /g, "").length > 0 &&
        beschreibung.replace(/ /g, "") !== saison.titel.replace(/ /g, ""))
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

export interface TileSaison {
  icon: string;
  hintergrundFarbe: string;
  textFarbe: string;
  titel: string;
  datum: string;
  bild?: string;
  beschreibung?: string;
  groesse: 1 | 2;
  hatDetails: boolean;
}

class Repository {
  public constructor() { }

  private saisons: TileSaison[];

  public async load() {
    this.saisons = this.normalize(
      this.shuffle(data.map((e: any) => convertToSaison(e))),
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
    for (const s of this.saisons) {
      summe += s.groesse;
      if (count <= summe) break;
      i++;
    }

    return this.saisons.splice(0, i);
  }

  public switch(s: TileSaison) {
    this.saisons.push(s);
    const nextIndex = this.saisons.findIndex(e => e.groesse === s.groesse);
    return this.saisons.splice(nextIndex, 1)[0];
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

  private normalize<T extends { groesse: number }>(saisons: T[], size: number) {
    let places = 0;
    for (let i = 0; i < saisons.length; i++) {
      const e1 = saisons[i];
      if (places + e1.groesse <= size) {
        places = (places + e1.groesse) % size;
        continue;
      }

      for (let ii = saisons.length - 1; ii > i; ii--) {
        const e2 = saisons[ii];
        if (places + e2.groesse <= size) {
          saisons[i] = e2;
          saisons[ii] = e1;
          places = (places + e2.groesse) % size;
          break;
        }
      }
    }
    return saisons;
  }
}

export const repository = new Repository();
