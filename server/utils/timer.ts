import * as cron from "node-cron";
import * as moment from "moment";

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sequenz(
  start: string,
  days: string,
  interval: number,
  functions: (() => void)[]
) {
  let next = moment.duration(start);
  for (const fn of functions) {
    cron
      .schedule(`0 ${next.minutes()} ${next.hours()} * * ${days}`, fn)
      .start();
    next = next.add(interval, "minutes");
  }
}
