import { getJson, putJson, delay } from "../utils";

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
}

export interface Group {
  name: string;
  type: string;
  state: {
    any_on: boolean;
    all_on: boolean;
  };
}

type Partial<T> = { [P in keyof T]?: T[P] };

export type SchedulerPartial = Partial<Scheduler>;

export interface GroupPartial {
  on?: boolean;
  hue?: number;
  effect?: string;
  scene?: string;
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

  public async queryGroups() {
    return await getJson<{ [index: string]: Group }>(this.baseUrl + "/groups");
  }

  public async updateGroups(id: string, attributes: GroupPartial) {
    await putJson(this.baseUrl + "/groups/" + id + "/action", attributes);
  }
}
