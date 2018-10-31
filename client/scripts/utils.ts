import React = require("react");

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

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Component<P, S> extends React.Component<P, S> {
  public subscribe = async (
    topic: string,
    mapping: (data: any) => any = (data: any) => data
  ) => {
    PubSub.subscribe(topic, (_message: any, state: any) => {
      this.setState(mapping(state));
    });

    const state = await getJson("/api/" + topic);
    this.setState(mapping(state));
  }

  public publish = async (topic: string, state: any) => {
    this.setState(state);

    await delay(0);
    await postJson("/api/" + topic, this.state);
    PubSub.publish(topic, this.state);
  }
}
