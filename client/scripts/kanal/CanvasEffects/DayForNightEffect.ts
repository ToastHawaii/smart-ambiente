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

export default class DayForNightEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    console.info("DayForNight: render");
    this.draw(canvas, this.adjustment);
  }
  public async update(canvas: HTMLCanvasElement) {
    console.info("DayForNight: update");
    this.draw(canvas, this.adjustment);
  }

  private draw(canvas: HTMLCanvasElement, adjustment: number) {
    const context = canvas.getContext("2d");
    if (!context) return;

    const pixels = this.getPixels(context);
    if (!pixels) return;
    const newPixels = this.dayForNight(pixels, -30 * (1 - adjustment));
    this.putPixels(context, newPixels);
  }

  private getPixels(ctx: CanvasRenderingContext2D) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private putPixels(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    return ctx.putImageData(imageData, 0, 0);
  }

  private dayForNight(pixels: ImageData, adjustment = -30) {
    const d = pixels.data;
    // These values serve as thresholds for the darkest and brightest possible values when
    // applying the 'blue-biased' desaturation. In the for loop below, no single RBG value
    // shall be less than `min` or greater than `max`.
    const min = 0;
    const max = 120;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      const v = 0.2126 * r + 0.07152 * g + 0.0722 * b;
      d[i] = Math.max(min, v);
      d[i + 1] = Math.max(min, v);
      d[i + 2] = Math.max(min, (0.7 * b + v) / 2);
      d[i] = Math.min(max, d[i]);
      d[i + 1] = Math.min(max, d[i + 1]);
      d[i + 2] = Math.min(max, d[i + 2]);
    }
    return this.brightness(pixels, adjustment);
  }

  private brightness(pixels: ImageData, adjustment: number) {
    const d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] += adjustment;
      d[i + 1] += adjustment;
      d[i + 2] += adjustment;
    }
    return pixels;
  }
}
