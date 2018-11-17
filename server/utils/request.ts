import * as request from "request";

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

export function getHtml(sourceUrl: string) {
  return new Promise<string>(resolve =>
    request.get(
      {
        url: sourceUrl,
        headers: { "User-Agent": "request" }
      },
      (err, _res, body) => {
        if (err) console.error("error on request: " + err);
        resolve(body);
      }
    )
  );
}
