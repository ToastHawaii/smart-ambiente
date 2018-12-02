import { CanvasEffect } from "./ImageEffect";
import { scale } from "../utils";

export default class ShimmerEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    canvas.style.animation = `animated-brightness ${Math.round(
      scale(this.adjustment, 0, 1, 60, 20)
    )}s infinite ease-in-out alternate`;
  }

  public async resize() {}

  public async update() {}
}

const css = `@keyframes animated-brightness {
  0% {
    filter: brightness(85%);
  }

  100% {
    filter: brightness(145%);
  }
}`;
const head = document.head || document.getElementsByTagName("head")[0];
const style = document.createElement("style");
style.type = "text/css";
style.appendChild(document.createTextNode(css));
head.appendChild(style);
