import { CanvasEffect } from "./ImageEffect";

export default class ClearEffect implements CanvasEffect {
  constructor(private canvasContext: CanvasRenderingContext2D) {}

  public render() {}

  public update() {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height
    );
  }
}
