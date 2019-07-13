import { JsonReader, Event } from "./Crawler";
import * as moment from "moment";
import debug from "../../utils/debug";
const topic = debug("Maps", true);


type Items = {
  events: Item[];
};

type Item = {
  date: string;
  title: string;
  description: string;
  location: string;
  transit: string;
  url: string;
};

export const mapsZueriAgendaReader: JsonReader<Items, Item> = {
  typ: "json",
  sourceName: "Maps Züri Agenda",
  sourceUrl: ["[http://maps-agenda.ch/maps/data?type=events&lang=de&date=]YYYY-MM-DD"],

  itemSelector: (listItems: Items) => {
    return listItems.events;
  },
  mapper: (listItem: Item) => {

    const events: Event[] = [];

    const date = moment(
      listItem.date,
      "M/D/YYYY",
      "de"
    );

    const dates = (listItem.title.match(/ \(.*\)/ig) || []).join("") || "(" + date.format("DD.MM.") + ")";

    const dateGroups = dates.substring(1, dates.length - 2).replace(/\//gi, ",").split(",");

    for (const dateGroup of dateGroups) {
      const startEnd = dateGroup.split("-");

      events.push({
        titel: listItem.title.replace(/ \(.*\)/ig, ""),
        beschreibung: listItem.description,
        ort: listItem.location,
        start: moment(
          startEnd[0] + date.format("YYYY"),
          "DD.MM.YYYY",
          "de"
        ),
        ende: startEnd[1] ? moment(
          startEnd[1] + date.format("YYYY"),
          "DD.MM.YYYY",
          "de"
        ) : undefined
      });
      topic("a", events[events.length - 1]);
    }

    return events;
  }
};
