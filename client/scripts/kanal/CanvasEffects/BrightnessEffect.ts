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

export default class BrightnessEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    console.info("BrightnessEffect: render");
    this.draw(canvas, (1 - this.adjustment - 0.5) * 2 * 5);
  }

  private draw(canvas: HTMLCanvasElement, adjustment: number) {
    const context = canvas.getContext("2d");
    if (!context) return;

    const pixels = this.getPixels(context);
    if (!pixels) return;
    const newPixels = this.brightness(pixels, adjustment);
    this.putPixels(context, newPixels);
  }

  private getPixels(ctx: CanvasRenderingContext2D) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private putPixels(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    return ctx.putImageData(imageData, 0, 0);
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
