import { CanvasEffect } from "./ImageEffect";

export default class ClearEffect implements CanvasEffect {
  constructor() {}

  public async render() {}

  public step(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}
