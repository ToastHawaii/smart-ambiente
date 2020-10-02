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

const MAX_PARTICLES = 100;
const DRAW_INTERVAL = 60;

class Circle {
  constructor() {}

  private settings = {
    ttl: 8000,
    xmax: 5,
    ymax: 2,
    rmax: 10,
    rt: 1,
    xdef: 960,
    ydef: 540,
    xdrift: 4,
    ydrift: 4,
    random: true,
    blink: true
  };

  private x: number;
  private y: number;
  private r: number;
  private dx: number;
  private dy: number;
  private hl: number;
  private rt: number;
  private stop: number;

  public reset(canvas: HTMLCanvasElement) {
    this.x = this.settings.random
      ? canvas.width * Math.random()
      : this.settings.xdef;
    this.y = this.settings.random
      ? canvas.height * Math.random()
      : this.settings.ydef;
    this.r = (this.settings.rmax - 1) * Math.random() + 1;
    this.dx =
      Math.random() * this.settings.xmax * (Math.random() < 0.5 ? -1 : 1);
    this.dy =
      Math.random() * this.settings.ymax * (Math.random() < 0.5 ? -1 : 1);
    this.hl =
      (this.settings.ttl / DRAW_INTERVAL) * (this.r / this.settings.rmax);
    this.rt = Math.random() * this.hl;
    this.settings.rt = Math.random() + 1;
    this.stop = Math.random() * 0.2 + 0.4;
    this.settings.xdrift *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
    this.settings.ydrift *= Math.random() * (Math.random() < 0.5 ? -1 : 1);
  }

  public fade(delta: number) {
    this.rt += this.settings.rt / (DRAW_INTERVAL / delta);
  }

  public move(canvas: HTMLCanvasElement, delta: number) {
    this.x += ((this.rt / this.hl) * this.dx) / (DRAW_INTERVAL / delta);
    this.y += ((this.rt / this.hl) * this.dy) / (DRAW_INTERVAL / delta);
    if (this.x > canvas.width || this.x < 0) this.dx *= -1;
    if (this.y > canvas.height || this.y < 0) this.dy *= -1;
  }

  public draw(canvas: HTMLCanvasElement) {
    if (this.settings.blink && (this.rt <= 0 || this.rt >= this.hl)) {
      this.settings.rt = this.settings.rt * -1;
    } else if (this.rt >= this.hl) {
      this.reset(canvas);
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    let newo = 1 - this.rt / this.hl;
    context.beginPath();
    context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    context.closePath();

    let cr = this.r * newo;
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      cr <= 0 ? 1 : cr
    );
    gradient.addColorStop(0.0, "rgba(255,255,255," + newo + ")");
    gradient.addColorStop(this.stop, "rgba(77,101,181," + newo * 0.6 + ")");
    gradient.addColorStop(1.0, "rgba(77,101,181, 0)");
    context.fillStyle = gradient;
    context.fill();
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }
}

export default class InsectEffect implements CanvasEffect {
  private pixies: Circle[];
  constructor() {}

  public async render(canvas: HTMLCanvasElement) {
    this.pixies = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pixies.push(new Circle());
      this.pixies[i].reset(canvas);
    }
  }

  public step(canvas: HTMLCanvasElement, deltaT: number) {
    for (let i = 0; i < this.pixies.length; i++) {
      this.pixies[i].fade(deltaT);
      this.pixies[i].move(canvas, deltaT);
      this.pixies[i].draw(canvas);
    }
  }
}
