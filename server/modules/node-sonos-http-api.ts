import { getJson } from "../utils/request";
import { delay } from "../utils/timer";
import debug from "../utils/debug";
const topic = debug("node-sonos-http-api", false);

export function createClient() {
  return new Sonos("http://localhost:5005");
}

class Room {
  public play() {
    this.commands.push("play");
    return this;
  }
  public unmute() {
    this.commands.push("unmute");
    return this;
  }
  public mute() {
    this.commands.push("mute");
    return this;
  }
  public groupUnmute() {
    this.commands.push("groupUnmute");
    return this;
  }
  public groupMute() {
    this.commands.push("groupMute");
    return this;
  }
  constructor(private baseUrl: string, private name: string) {}
  private commands: string[] = [];

  public async do() {
    const command = this.commands.shift();
    if (command !== undefined) {
      topic(this.baseUrl + "/" + this.name + "/" + command);
      await getJson(this.baseUrl + "/" + this.name + "/" + command);
      await delay(10);
      await this.do();
    }
  }

  public async state() {
    return await getJson<{
      status?: "error";
      volume: number;
      mute: boolean;
      currentTrack: {
        uri: string;
      };
      playbackState: "PLAYING";
    }>(this.baseUrl + "/" + this.name + "/state");
  }

  public crossfade(state: "on" | "off") {
    this.commands.push("crossfade/" + state);
    return this;
  }
  public shuffle(state: "on" | "off") {
    this.commands.push("shuffle/" + state);
    return this;
  }
  public repeat(state: "on" | "off") {
    this.commands.push("repeat/" + state);
    return this;
  }
  public pause() {
    this.commands.push("pause");
    return this;
  }
  public volume(value: number) {
    this.commands.push("volume/" + value);
    return this;
  }

  public join(toRoom: string) {
    this.commands.push("join/" + toRoom);
    return this;
  }

  public leave(toRoom: string) {
    this.commands.push("leave/" + toRoom);
    return this;
  }

  public musicsearch(
    service: "library",
    type: "album" | "song" | "load",
    searchTerm: string
  ): this;
  public musicsearch(
    service: "apple" | "spotify" | "deezer" | "elite" | "library",
    type: "album" | "song" | "station" | "playlist",
    searchTerm: string
  ): this;
  public musicsearch(service: string, type: string, searchTerm: string) {
    this.commands.push(
      "musicsearch/" + service + "/" + type + "/" + searchTerm
    );

    return this;
  }

  public playlist(name: string) {
    this.commands.push("playlist/" + name);
    return this;
  }
  public favorite(name: string) {
    this.commands.push("favorite/" + name);
    return this;
  }
}

class Sonos {
  constructor(private baseUrl: string) {}

  public room(name: string) {
    return new Room(this.baseUrl, name);
  }
}
