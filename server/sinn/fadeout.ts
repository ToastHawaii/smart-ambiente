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

import { sequenz } from "../utils/timer";
import { setSinn } from "../server";

const interval = 1; // min

(async function () {
  sequenz("11:35", "0-6", interval, [
    async () => {
      setSinn("ton", { lautstaerke: "8" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "6" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "5" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "4" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "3" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "2" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "1" }, "alarm");
    },
    async () => {
      setSinn("ton", { lautstaerke: "aus" }, "alarm");
    },
  ]);
})();
