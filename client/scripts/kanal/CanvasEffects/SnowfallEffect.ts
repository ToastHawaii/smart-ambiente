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

export default class SnowfallEffect implements CanvasEffect {
  public snowflakes: Snowflake[] = [];
  public windSpeed = 0;
  public parent = document.body;
  public maxWindSpeed = 4;
  public maxNumberOfSnowFlakes = 0;

  public step(canvas: HTMLCanvasElement, deltaT: number) {
    if (this.windSpeed > this.maxWindSpeed * 10)
      this.windSpeed += normalDistributionInt(-2, 1);
    else if (this.windSpeed < this.maxWindSpeed * -10)
      this.windSpeed += normalDistributionInt(-1, 2);
    else this.windSpeed += normalDistributionInt(-2, 2);

    const deltaSpeed = (deltaT / (1000 / 60) / 60) * 25;
    const windSpeed = this.windSpeed / 10;
    for (let f of this.snowflakes) f.fall(windSpeed, deltaSpeed);

    this.snowflakes = this.snowflakes.filter(f => !f.removed);

    if (
      (this.maxNumberOfSnowFlakes === 0 ||
        this.snowflakes.length < this.maxNumberOfSnowFlakes) &&
      randomInt(0, 10) > 5
    )
      this.snowflakes.push(new Snowflake(canvas));
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalDistributionInt(min: number, max: number) {
  return (
    Math.floor(
      ((Math.random() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random()) /
        6) *
        (max - min + 1)
    ) + min
  );
}

export class Snowflake {
  public minSnowFlakeDensity = 2;
  public maxSnowFlakeDensity = 10;
  public maxSpeedRotation = 5;

  public x: number;
  public y: number;
  public density: number;
  public rotation: number;
  public speedX: number;
  public speedY: number;
  public speedRotation: number;
  public element: HTMLElement;
  public removed = false;

  private speed = (this.maxSnowFlakeDensity + this.minSnowFlakeDensity) / 2;
  public constructor(public parent: HTMLElement) {
    this.x = randomInt(0, this.parent.clientWidth);
    this.y = 0;
    this.density = randomInt(
      this.minSnowFlakeDensity,
      this.maxSnowFlakeDensity
    );
    this.rotation = randomInt(0, 180);

    this.speedX = (normalDistributionInt(-2, 2) / this.speed) * this.density;
    this.speedY = (normalDistributionInt(1, 3) / this.speed) * this.density;
    this.speedRotation =
      (normalDistributionInt(-5, 5) / this.speed) * this.density;

    this.render();
  }

  private render() {
    this.element = document.createElement("div");
    this.element.style.cssText = `
        position: fixed;
        background-color: rgb(140, 140, 200);
        transform: translate(${this.x}px, ${this.y}px) rotate(${
      this.rotation
    }deg);
        color: rgba(255, 255, 255, 0);
        pointer-events: none;
        border-radius: ${normalDistributionInt(1, 50)}%;
        width: 1px;
        height: ${normalDistributionInt(1, this.density / 2)}px;
        box-shadow: 0px 0px ${normalDistributionInt(
          this.density / 3,
          this.density
        )}px ${this.density}px rgb(140, 140, 200);
        opacity: 0.${normalDistributionInt(5, 9)};
      `;
    this.element.appendChild(document.createTextNode("."));
    if (!this.parent.parentElement) return;
    this.parent.parentElement.appendChild(this.element);
  }

  public fall(wind: number, deltaSpeed: number) {
    this.x += ((this.speedX + wind) / this.speed) * this.density * deltaSpeed;
    this.y += this.speedY * deltaSpeed;

    if (this.speedRotation > this.maxSpeedRotation * 3)
      this.speedRotation += normalDistributionInt(-3, 1);
    else if (this.speedRotation < this.maxSpeedRotation * -3)
      this.speedRotation += normalDistributionInt(-1, 3);
    else this.speedRotation += normalDistributionInt(-3, 3);

    this.rotation += (this.speedRotation + wind) * deltaSpeed;

    if (this.x < 0) this.x = this.parent.clientWidth;
    else if (this.x > this.parent.clientWidth) this.x = 0;

    if (this.y > this.parent.clientHeight || this.y < 0) {
      this.element.remove();
      this.removed = true;
    } else
      this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
  }
}
