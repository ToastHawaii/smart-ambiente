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

export function random(
  from: number | undefined = undefined,
  to: number | undefined = undefined,
  interpolation: ((n: number) => number) | undefined = undefined
) {
  if (from === undefined) {
    from = 0;
    to = 1;
  } else if (from !== undefined && to === undefined) {
    to = from;
    from = 0;
  }
  if (to === undefined) to = 0;

  const delta = to - from;

  if (interpolation === undefined) {
    interpolation = (n: number) => {
      return n;
    };
  }
  return from + interpolation(Math.random()) * delta;
}
export function chance(c: number) {
  return random() <= c;
}
