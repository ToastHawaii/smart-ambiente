import * as React from "react";
import * as PubSub from "pubsub-js";
import { getJson, delay, postJson } from "../utils";

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
  public publish = async (
    topic: string,
    state: any,
    mapping: (data: any) => any = (data: any) => data
  ) => {
    this.setState(state);
    await delay(0);
    PubSub.publish(topic, mapping(this.state));
    await postJson("/api/" + topic, mapping(this.state));
  }
}
