export async function postJson(url: string, data: any) {
  const response = await fetch(url, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export async function getJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  });

  return response.json();
}
