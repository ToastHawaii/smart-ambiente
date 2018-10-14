import * as request from "request";

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

  public querySchedules(
    callback: (result: { [index: string]: Scheduler }) => void
  ) {
    request.get(
      this.baseUrl + "/schedules",
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public getSchedules(id: string, callback: (result: Scheduler) => void) {
    request.get(
      this.baseUrl + "/schedules/" + id,
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public updateSchedules(id: string, attributes: SchedulerPartial) {
    request.put(this.baseUrl + "/schedules/" + id, {
      json: true,
      body: attributes
    });
  }

  public updateSchedulesEnabled(id: string, i = 0) {
    request.put(
      this.baseUrl + "/schedules/" + id,
      { json: true, body: { status: "enabled" } },
      () => {
        if (i < 6) {
          setTimeout(() => {
            this.getSchedules(id, scheduler => {
              if (scheduler && scheduler.status !== "enabled") {
                // console.log(scheduler.name + " Ein Retry");
                this.updateSchedulesEnabled(id, i + 1);
              }
            });
          }, 5);
        }
      }
    );
  }

  public updateSchedulesDisabled(id: string, i = 0) {
    request.put(
      this.baseUrl + "/schedules/" + id,
      { json: true, body: { status: "disabled" } },
      () => {
        if (i < 6) {
          setTimeout(() => {
            this.getSchedules(id, scheduler => {
              if (scheduler && scheduler.status !== "disabled") {
                // console.log(scheduler.name + " Aus Retry");
                this.updateSchedulesDisabled(id, i + 1);
              }
            });
          }, 5);
        }
      }
    );
  }

  public updateSensorsState(id: string, state: any) {
    request.put(this.baseUrl + "/sensors/" + id + "/state", {
      json: true,
      body: state
    });
  }

  public querySensors(callback: (result: { [index: string]: Sensor }) => void) {
    request.get(
      this.baseUrl + "/sensors",
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public getSensors(id: string, callback: (result: Sensor) => void) {
    request.get(
      this.baseUrl + "/sensors/" + id,
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public getLights(id: string, callback: (result: Light) => void) {
    request.get(
      this.baseUrl + "/lights/" + id,
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public getGroups(id: string, callback: (result: Group) => void) {
    request.get(
      this.baseUrl + "/groups/" + id,
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public queryGroups(callback: (result: { [index: string]: Group }) => void) {
    request.get(
      this.baseUrl + "/groups",
      { json: true },
      (_err, _res, body) => {
        callback(body);
      }
    );
  }

  public updateGroups(id: string, attributes: GroupPartial) {
    request.put(this.baseUrl + "/groups/" + id + "/action", {
      json: true,
      body: attributes
    });
  }
}
