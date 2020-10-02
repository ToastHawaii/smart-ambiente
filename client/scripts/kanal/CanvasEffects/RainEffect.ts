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

import { CanvasEffect } from "./ImageEffect";
import { imageFromSource } from "../../utils";
import Raindrops from "./raineffect/raindrops";
import RainRenderer from "./raineffect/rain-renderer";

export default class RainEffect implements CanvasEffect {
  constructor(private level: number = 1) {}

  private raindrops: Raindrops;
  private rainRenderer: RainRenderer;
  private dropColor: HTMLImageElement;
  private dropAlpha: HTMLImageElement;

  public async render(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ) {
    this.dropColor = await imageFromSource("img/rain/drop-color.png");
    this.dropAlpha = await imageFromSource("img/rain/drop-alpha.png");

    this.init(canvas, underlyingCanvas[0]);
  }

  private init(canvas: HTMLCanvasElement, texture: HTMLCanvasElement) {
    const dpi = window.devicePixelRatio;
    this.raindrops = new Raindrops(
      canvas.width,
      canvas.height,
      dpi,
      this.dropAlpha,
      this.dropColor,
      {
        trailRate: 1,
        trailScaleRange: [0.2, 0.45],
        collisionRadius: 0.45,
        dropletsCleaningRadiusMultiplier: 0.28,
        maxDrops: 900 * this.level,
        rainChance: 0.3 * this.level,
        rainLimit: 3 * this.level,
        dropletsRate: 50 * this.level
      }
    );
    this.rainRenderer = new RainRenderer(
      canvas,
      this.raindrops.canvas,
      texture,
      undefined,
      {
        brightness: 1.04,
        alphaMultiply: 6,
        alphaSubtract: 3
      }
    );
  }

  public step(_canvas: HTMLCanvasElement, deltaT: number) {
    this.raindrops.update(deltaT);
    this.rainRenderer.draw();
  }
}
