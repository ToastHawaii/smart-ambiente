import { HtmlReader, Event } from "./Crawler";
import * as moment from "moment";
import debug from "../../utils/debug";
const topic = debug("Events/MeetupReader", false);

export const meetupReader: HtmlReader = {
  typ: "html",
  sourceName: "meetup.com",
  sourceUrl: [
    "[https://www.meetup.com/de-DE/find/events/?allMeetups=true&radius=16&userFreeform=Z%C3%BCrich%2C+Schweiz&mcId=z1005076&mcName=Z%C3%BCrich%2C+CH&month=]M[&day=]D[&year=]YYYY"
  ],
  itemSelector: '[itemtype="http://data-vocabulary.org/Event"]',
  sourceDetailUrl: $item => {
    return $item.find('.event[itemprop="url"]').attr("href");
  },
  mapper: (_$listItem: Cheerio, $detailItem?: Cheerio) => {
    if (!$detailItem) return [];

    const eventJson =
      $detailItem
        .parent()
        .find('script[type="application/ld+json"]')
        .first()
        .html() || "";

    const startDate = /\"startDate\":\"([0-9\-\:T\+]+)\"/gi.exec(eventJson);
    const endDate = /\"endDate\":\"([0-9\-\:T\+]+)\"/gi.exec(eventJson);
    const location = /\"PostalAddress\",\"streetAddress\":\"([^\\"]+)\",\"addressLocality\":\"([^\\"]+)\"/gi.exec(
      eventJson
    );

    topic("event", { content: eventJson, startDate, endDate, location });

    if (!(startDate && startDate[1])) return [];

    const event: Event = {
      titel: $detailItem.find("h1").text(),
      beschreibung: $detailItem.find(".event-description").text(),
      start: moment(startDate[1]),
      ende: endDate && endDate[1] ? moment(endDate[1]) : undefined,
      ort: location && location[1] ? `${location[1]} ${location[2]}` : undefined
    };

    return [event];
  }
};
