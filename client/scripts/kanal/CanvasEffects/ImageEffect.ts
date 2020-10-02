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

import { imageFromSource } from "../../utils";

export interface CanvasEffect {
  automaticUpdates?: boolean;

  render?(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ): Promise<void>;

  update?(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ): void;

  step?(
    canvas: HTMLCanvasElement,
    deltaT: number,
    underlyingCanvas: HTMLCanvasElement[]
  ): void;
}

export default class ImageEffect implements CanvasEffect {
  constructor(private src: string) {}

  private draw(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    x = 0,
    y = 0,
    w = canvas.width,
    h = canvas.height,
    offsetX = 0.5,
    offsetY = 0.5
  ) {
    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const r = Math.min(w / iw, h / ih);
    let nw = iw * r;
    let nh = ih * r;
    let cx;
    let cy;
    let cw;
    let ch;
    let ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    // fill image in dest. rectangle
    canvasContext.drawImage(image, cx, cy, cw, ch, x, y, w, h);
  }

  public async render(canvas: HTMLCanvasElement) {
    console.info("Image: render " + this.src);
    const image = await imageFromSource(this.src);
    this.draw(image, canvas);
  }
}
