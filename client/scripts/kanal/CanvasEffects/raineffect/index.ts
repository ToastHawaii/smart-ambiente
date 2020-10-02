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

import "core-js";
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import { imageFromSource } from "../../../utils";

export default async function init(
  texture: HTMLCanvasElement,
  canvas: HTMLCanvasElement,
  level: number = 1
) {
  const dpi = window.devicePixelRatio;

  const dropColor = await imageFromSource("img/rain/drop-color.png");
  const dropAlpha = await imageFromSource("img/rain/drop-alpha.png");

  const raindrops = new Raindrops(
    canvas.width,
    canvas.height,
    dpi,
    dropAlpha,
    dropColor,
    {
      trailRate: 1,
      trailScaleRange: [0.2, 0.45],
      collisionRadius: 0.45,
      dropletsCleaningRadiusMultiplier: 0.28,

      maxDrops: 900 * level,
      rainChance: 0.3 * level
    }
  );

  new RainRenderer(canvas, raindrops.canvas, texture, undefined, {
    brightness: 1.04,
    alphaMultiply: 6,
    alphaSubtract: 3
    // minRefraction:256,
    // maxRefraction:512
  });
}
