import { inspect } from "util";

function debug(topic: string) {
  return function(message: string, obj?: object) {
    if (debug.enabled) {
      if (!obj) console.log(`[${topic}] ${message}`);
      else console.log(`[${topic}] ${message} ${inspect(obj)}`);
    }
  };
}

namespace debug {
  export let enabled: boolean = false;
}

export default debug;
