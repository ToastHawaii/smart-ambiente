// Copyright (C) 2020 Markus Peloso
// 
// This file is part of smart-ambiente.
// 
// smart-ambiente is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// smart-ambiente is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with smart-ambiente.  If not, see <http://www.gnu.org/licenses/>.

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
