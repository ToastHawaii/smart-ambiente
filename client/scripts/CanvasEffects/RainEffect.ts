import { CanvasEffect } from "./ImageEffect";
import RainEffect2 from "./raineffect/index";

export default class RainEffect implements CanvasEffect {
  constructor() {}

  public async render(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ) {
    RainEffect2(underlyingCanvas[0], canvas);
  }

  public async resize() {}

  public async update() {}
}
