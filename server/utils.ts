import request = require("request");

export function toArray<O extends { [index: string]: T }, T>(o: O) {
  const a: (T & { id: string })[] = [];
  for (const p in o) {
    const i = (o[p] as any) as T & { id: string };
    i.id = p;
    a.push(i);
  }
  return a;
}

export function calcRelativeValue(
  value: number,
  refValue: number,
  targetValue: number
) {
  if (value >= refValue)
    return Math.round(
      (100 - targetValue) * (1 / (100 - refValue)) * (value - refValue) +
        targetValue
    );
  else
    return Math.round(
      targetValue * (1 / refValue) * (value - refValue) + targetValue
    );
}

export function getJson<T>(url: string) {
  return new Promise<T>(resolve => {
    request.get(url, { json: true }, (_err, _res, body) => {
      resolve(body);
    });
  });
}

export function putJson(url: string, body: any) {
  return new Promise<void>(resolve => {
    request.put(url, { json: true, body: body }, () => {
      resolve();
    });
  });
}

export function postJson(url: string, body: any) {
  return new Promise<void>(resolve => {
    request.post(url, { json: true, body: body }, () => {
      resolve();
    });
  });
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export function midrange(...values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (min + max) / 2;
}
