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

import { inspect } from "util";

function debug(topic: string, enabled = true) {
  return function(message: string, obj?: object) {
    if (debug.enabled && enabled) {
      if (!obj) console.log(`[${topic}] ${message}`);
      else console.log(`[${topic}] ${message} ${inspect(obj)}`);
    }
  };
}

namespace debug {
  export let enabled: boolean = false;
}

export default debug;
