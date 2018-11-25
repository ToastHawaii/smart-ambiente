import { CanvasEffect } from "./ImageEffect";

export default class DayForNightEffect implements CanvasEffect {
  constructor(
    private canvasContext: CanvasRenderingContext2D,
    private adjustment = 1
  ) {}

  public render() {
    this.draw(this.canvasContext, this.adjustment);
  }

  public update() {
    this.draw(this.canvasContext, this.adjustment);
  }

  private draw(canvasContext: CanvasRenderingContext2D, adjustment = 1) {
    const pixels = this.getPixels(canvasContext);
    if (!pixels) return;
    const newPixels = this.dayForNight(pixels, -25 * adjustment);
    this.putPixels(canvasContext, newPixels);
  }

  private getPixels(ctx: CanvasRenderingContext2D) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private putPixels(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    return ctx.putImageData(imageData, 0, 0);
  }

  private dayForNight(pixels: ImageData, adjustment = -25) {
    const d = pixels.data;
    // These values serve as thresholds for the darkest and brightest possible values when
    // applying the 'blue-biased' desaturation. In the for loop below, no single RBG value
    // shall be less than `min` or greater than `max`.
    const min = 0;
    const max = 120;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      const v = 0.2126 * r + 0.07152 * g + 0.0722 * b;
      d[i] = Math.max(min, v);
      d[i + 1] = Math.max(min, v);
      d[i + 2] = Math.max(min, (0.7 * b + v) / 2);
      d[i] = Math.min(max, d[i]);
      d[i + 1] = Math.min(max, d[i + 1]);
      d[i + 2] = Math.min(max, d[i + 2]);
    }
    return this.brightness(pixels, adjustment);
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
