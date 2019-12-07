import * as React from "react";
import * as PubSub from "pubsub-js";
import { getJson, delay, postJson } from "../utils";

export class Component<P, S> extends React.Component<P, S> {
  public subscribe = async (
    topic: string,
    mapping: (data: any) => any | Promise<any> = (data: any) => data
  ) => {
    PubSub.subscribe(topic, async (_message: any, state: any) => {
      const data = await toData(mapping(state));
      this.setState(data);
    });

    const data = await toData(mapping(await getJson("/api/" + topic)));
    this.setState(data);
  };

  public publish = async (
    topic: string,
    state: any,
    mapping: (data: any) => any | Promise<any> = (data: any) => data
  ) => {
    this.setState(state);
    await delay(0);

    const data = await toData(mapping(this.state));
    const result = await postJson("/api/" + topic, data);
    PubSub.publish(topic, result);
  };
}

function isPromise(result: any | Promise<any>): result is Promise<any> {
  return !!result.then;
}

async function toData(result: any | Promise<any>) {
  if (isPromise(result)) {
    return await result;
  }
  return result;
}
