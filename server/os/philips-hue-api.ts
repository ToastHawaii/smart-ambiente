import { getJson, putJson } from "../utils/request";
import { delay } from "../utils/timer";
import { toArray } from "../utils/array";

export function createHueService(baseUrl: string) {
  return new Hue(baseUrl);
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
  on: boolean;
  bri: number;
  ct: number;
  xy: [number, number];
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

class Hue {
  public constructor(private baseUrl: string) {}

  public async querySchedules() {
    return await getJson<{ [index: string]: Scheduler }>(
      this.baseUrl + "/schedules"
    );
  }

  public async getSchedules(id: string) {
    return await getJson<Scheduler>(this.baseUrl + "/schedules/" + id);
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
    return { ...(await this.getScenes(scene.id)), id: scene.id };
  }

  public async queryScenes() {
    return await getJson<{ [index: string]: Scene }>(this.baseUrl + "/scenes");
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

  public async recallScene(
    roomName: string,
    sceneName: string,
    transitiontime?: number
  ) {
    const group = await this.getGroupByName(roomName);
    const scene = await this.getSceneByName(group.id, sceneName);

    for (const light of scene.lights) {
      await this.setLightState(light, {
        ...scene.lightstates[light],
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
      promise = this.updateGroups(s.id, attributes);
    }
    if (promise) await promise;
    await delay((attributes.transitiontime || 4) * 100);
  }

  public async updateGroupByName(roomName: string, attributes: GroupPartial) {
    const group = await this.getGroupByName(roomName);
    await this.updateGroups(group.id, attributes);

    await delay((attributes.transitiontime || 4) * 100);
  }
}
