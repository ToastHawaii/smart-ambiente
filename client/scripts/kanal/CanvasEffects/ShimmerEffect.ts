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
import { scale } from "../../utils";

export default class ShimmerEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    canvas.style.animation = `animated-brightness ${Math.round(
      scale(this.adjustment, 0, 1, 60, 20)
    )}s infinite ease-in-out alternate`;
  }
}

const css = `@keyframes animated-brightness {
  0% {
    -webkit-filter: brightness(85%);
    filter: brightness(85%);
  }

  100% {
    -webkit-filter: brightness(115%);
    filter: brightness(115%);
  }
}`;
const head = document.head || document.getElementsByTagName("head")[0];
const style = document.createElement("style");
style.type = "text/css";
style.appendChild(document.createTextNode(css));
head.appendChild(style);
