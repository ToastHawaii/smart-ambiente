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

import { getJson, postJson, putJson } from "../utils/request";
import { delay } from "../utils/timer";
import { toArray } from "../utils/array";
import debug from "../utils/debug";
const topic = debug("philips-hue-api", false);

export function createHueService(baseUrl: string, scenes: Scenes) {
  return new Hue(baseUrl, scenes);
}

export interface Scheduler {
  name: string;
  description: string;
  command: {
    address: string;
    body: {
      scene: string;
    };
    method: string;
  };
  time: string;
  created: string;
  status: "enabled" | "disabled";
  autodelete: boolean;
  starttime: string;
}

export interface Rule {
  name: string;
  conditions: {
    address: string;
  }[];
  status: "enabled" | "disabled";
}

export interface Sensor {
  state: {
    status?: 0 | 1;
    buttonevent?: 34 | 16 | 17 | 18;
    presence?: boolean;
    lastupdated: string;
  };
  name: string;
  type: string;
}

export interface Light {
  state: {
    on: boolean;
  };
  name: string;
  type: string;
  group: string;
}

export interface Group {
  name: string;
  lights: string[];
  type: string;
  state: {
    any_on: boolean;
    all_on: boolean;
  };
}
export interface Scene {
  name: string;
  type: "GroupScene";
  group: string;
  lights: string[];
  owner: string;
  recycle: boolean;
  locked: boolean;
  picture: string;
  lightstates: {
    [id: string]: LightPartial;
  };
}

export interface LightPartial {
  on?: boolean;
  bri?: number;
  ct?: number;
  xy?: [number, number];
  transitiontime?: number;
}

export interface ScenePartial {
  transitiontime?: number;
}

type Partial<T> = { [P in keyof T]?: T[P] };

export type SchedulerPartial = Partial<Scheduler>;

export interface GroupPartial {
  on?: boolean;
  hue?: number;
  effect?: string;
  scene?: string;
  transitiontime?: number;
}

export type Scenes = {
  name: string;
  group: string;
  lights: { [name: string]: LightPartial };
}[];

class Hue {
  public constructor(private baseUrl: string, private scenes: Scenes) {}

  public async queryRules() {
    return await getJson<{ [index: string]: Rule }>(this.baseUrl + "/rules");
  }

  public async getRulesByConditionAddress(address: string): Promise<Rule> {
    const result = await this.queryRules();
    const rule = toArray<{ [index: string]: Rule }, Rule>(result);

    return rule.filter(
      (g: Rule) => g.conditions.filter(c => c.address === address).length > 0
    )[0];
  }

  public async getHueLabToggleSensor(name: string) {
    const scheduler = await this.getSchedulesByName(name);
    const address = scheduler.command.address.substr(14) + "/status";

    await delay(100);
    const rule = await this.getRulesByConditionAddress(address);
    return rule.conditions
      .map(c => c.address)
      .filter(a => /\/sensors\/([0-9]*)\/state\/status/gi.test(a))
      .filter(a => a !== address)
      .map(a => (/\/sensors\/([0-9]*)\/state\/status/gi.exec(a) || [])[1])[0];
  }

  public async updateHueLabToggle(id: string, state: number) {
    const sensor = await this.getSensors(id);
    if (sensor.state.status !== state)
      await this.updateSensorsState(id, { status: state });
  }

  public async updateHueLabToggleByName(name: string, state: number) {
    const sensor = await this.getHueLabToggleSensor(name);
    await this.updateHueLabToggle(sensor, state);
  }

  public async updateAllHueLabToggleByName(name: RegExp, state: number) {
    topic("updateAllHueLabToggleByName" + name);
    const allSchedulers = toArray<{ [index: string]: Scheduler }, Scheduler>(
      await this.querySchedules()
    );
    const schedulers = allSchedulers
      .filter(s => name.test(s.name))
      .map(s => s.command.address.substr(14) + "/status")
      .filter((v, i, a) => a.indexOf(v) === i);

    await delay(100);
    const allRules = toArray<{ [index: string]: Rule }, Rule>(
      await this.queryRules()
    );

    for (const scheduler of schedulers) {
      const rule = allRules.filter(
        (r: Rule) =>
          r &&
          r.conditions.filter(c => {
            return c.address.endsWith(scheduler);
          }).length > 0
      )[0];
      const sensor = rule.conditions
        .map(c => c.address)
        .filter(a => /\/sensors\/([0-9]*)\/state\/status/gi.test(a))
        .filter(a => a !== scheduler)
        .map(a => (/\/sensors\/([0-9]*)\/state\/status/gi.exec(a) || [])[1])[0];

      await this.updateHueLabToggle(sensor, state);
    }
  }

  public async querySchedules() {
    return await getJson<{ [index: string]: Scheduler }>(
      this.baseUrl + "/schedules"
    );
  }

  public async getSchedules(id: string) {
    return await getJson<Scheduler>(this.baseUrl + "/schedules/" + id);
  }

  public async getSchedulesByName(name: string): Promise<Scheduler> {
    const result = await this.querySchedules();
    const scheduler = toArray<{ [index: string]: Scheduler }, Scheduler>(
      result
    );
    return scheduler.filter(g => g.name === name)[0];
  }

  public async updateSchedules(id: string, attributes: SchedulerPartial) {
    await putJson(this.baseUrl + "/schedules/" + id, attributes);
  }

  public async updateSchedulesEnabled(id: string, i = 0) {
    await putJson(this.baseUrl + "/schedules/" + id, { status: "enabled" });

    if (i < 6) {
      await delay(5);
      const scheduler = await this.getSchedules(id);
      if (scheduler && scheduler.status !== "enabled") {
        // console.log(scheduler.name + " Ein Retry");
        this.updateSchedulesEnabled(id, i + 1);
      }
    }
  }

  public async updateSchedulesDisabled(id: string, i = 0) {
    await putJson(this.baseUrl + "/schedules/" + id, { status: "disabled" });
    if (i < 6) {
      await delay(5);
      const scheduler = await this.getSchedules(id);
      if (scheduler && scheduler.status !== "disabled") {
        // console.log(scheduler.name + " Aus Retry");
        this.updateSchedulesDisabled(id, i + 1);
      }
    }
  }

  public async updateSensorsState(id: string, state: any) {
    await putJson(this.baseUrl + "/sensors/" + id + "/state", state);
  }

  public async querySensors() {
    return await getJson<{ [index: string]: Sensor }>(
      this.baseUrl + "/sensors"
    );
  }

  public async getSensors(id: string) {
    return await getJson<Sensor>(this.baseUrl + "/sensors/" + id);
  }

  public async getLights(id: string) {
    return await getJson<Light>(this.baseUrl + "/lights/" + id);
  }

  public async getLightByName(name: string) {
    const result = await this.queryLights();
    const lights = toArray<{ [index: string]: Light }, Light>(result);
    return lights.filter(l => l.name === name)[0];
  }

  public async queryLights() {
    return await getJson<{ [index: string]: Light }>(this.baseUrl + "/lights");
  }

  public async getGroups(id: string) {
    return await getJson<Group>(this.baseUrl + "/groups/" + id);
  }

  public async getGroupByName(name: string) {
    const result = await this.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);
    return groups.filter(g => g.name === name)[0];
  }

  public async getGroupsByName(names: string[]) {
    const result = await this.queryGroups();
    const groups = toArray<{ [index: string]: Group }, Group>(result);

    return groups.filter(g => names.indexOf(g.name) >= 0);
  }

  public async queryGroups() {
    return await getJson<{ [index: string]: Group }>(this.baseUrl + "/groups");
  }

  public async updateGroups(id: string, attributes: GroupPartial) {
    await putJson(this.baseUrl + "/groups/" + id + "/action", attributes);
  }

  public async getScenes(id: string) {
    return await getJson<Scene>(this.baseUrl + "/scenes/" + id);
  }

  public async getSceneByName(groupId: string, name: string) {
    const result = await this.queryScenes();
    const scenes = toArray<{ [index: string]: Scene }, Scene>(result);
    const scene = scenes.filter(g => g.name === name && g.group === groupId)[0];
    return { ...(await this.getScenes(scene.id!)), id: scene.id };
  }

  public async queryScenes() {
    return await getJson<{ [index: string]: Scene }>(this.baseUrl + "/scenes");
  }

  public async createScenes(
    group: string,
    name: string,
    lightstates: {
      [id: string]: LightPartial;
    }
  ) {
    await postJson(this.baseUrl + "/scenes/", {
      type: "GroupScene",
      appdata: {
        version: 1,
        data: "Gl1Xm_r05_d99"
      },
      group,
      name,
      lightstates,
      recycle: false
    });
  }

  public async updateScenesLightstates(
    id: string,
    lightId: string,
    attributes: LightPartial
  ) {
    await putJson(
      this.baseUrl + "/scenes/" + id + "/lightstates/" + lightId,
      attributes
    );
  }

  public async setLightState(id: string, attributes: LightPartial) {
    await putJson(this.baseUrl + "/lights/" + id + "/state", attributes);
  }

  public async setLightStateByGroupByNames(
    roomNames: string[],
    attributes: LightPartial
  ) {
    for (const group of await this.getGroupsByName(roomNames)) {
      for (const light of group.lights) {
        await this.setLightState(light, attributes);
      }
    }
  }

  public async recallScene(
    roomName: string,
    sceneName: string,
    transitiontime?: number
  ) {
    const scene = this.scenes.filter(
      s => s.name === sceneName && s.group === roomName
    )[0];

    for (const light of toArray<{ [name: string]: LightPartial }, LightPartial>(
      scene.lights
    )) {
      await this.setLightState((await this.getLightByName(light.id!)).id!, {
        ...light,
        transitiontime: transitiontime
      });
    }

    await delay((transitiontime || 4) * 100);
  }

  public async recallScenes(
    roomNames: string[],
    sceneName: string,
    transitiontime?: number
  ) {
    let promise: Promise<void> | undefined;
    for (const roomName of roomNames) {
      promise = this.recallScene(roomName, sceneName, transitiontime);
    }
    if (promise) await promise;
  }

  public async updateGroupsByName(
    roomNames: string[],
    attributes: GroupPartial
  ) {
    let promise: Promise<void> | undefined;
    for (const s of await this.getGroupsByName(roomNames)) {
      promise = this.updateGroups(s.id!, attributes);
    }
    if (promise) await promise;
    await delay((attributes.transitiontime || 4) * 100);
  }

  public async updateGroupByName(roomName: string, attributes: GroupPartial) {
    const group = await this.getGroupByName(roomName);
    await this.updateGroups(group.id!, attributes);

    await delay((attributes.transitiontime || 4) * 100);
  }
}
