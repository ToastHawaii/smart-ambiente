import { StaticReader } from "./Crawler";
import * as moment from "moment";

export const stadtZuerichSozialdepartementReader: StaticReader = {
  typ: "static",
  sourceName: "Stadt Zürich Sozialdepartement",
  get: () => {

    return [{
      kategorie: "Meditation",
      titel: "Achtsamkeits Meditation",
      beschreibung: "Wir treffen uns regelmässig, um gemeinsam zu meditieren und positiv in die Woche zu starten. Bitte bring ein Kissen und eine Decke als Unterlage mit. Melde dich kurz per Mail. Kosten: Spende für die Raumkosten.",
      start: moment("18:30", "HH:mm").weekday(8),
      ende: moment("19:45", "HH:mm").weekday(8),
      ort: "Quartierraum Zentralstrasse, Zentralstrasse 34, 8003 Zürich",

    }, {
      kategorie: "Brett- und Kartenspiel",
      titel: "Spieltreff Zürich Wiedikon",
      beschreibung: "Regelmässiger Treff für Karten- oder Brettspiele. Kleiner Unkostenbeitrag für die Raummiete und Finanzierung neuer Spiele.",
      start: moment("19:00", "HH:mm").weekday(10),
      ende: moment("22:00", "HH:mm").weekday(10),
      ort: "Quartierraum Zentralstrasse, Zentralstrasse 34, 8003 Zürich",
    },
    ];
  }
};
