import { CanvasEffect } from "./ImageEffect";

export default class BrightnessEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    console.info("BrightnessEffect: render");
    this.draw(canvas, (1 - this.adjustment - 0.5) * 2 * 5);
  }

  public async resize(canvas: HTMLCanvasElement) {
    console.info("BrightnessEffect: resize");
    this.draw(canvas, (1 - this.adjustment - 0.5) * 2 * 5);
  }

  public async update() {}

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
