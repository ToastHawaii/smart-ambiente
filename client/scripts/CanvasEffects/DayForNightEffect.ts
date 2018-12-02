import { CanvasEffect } from "./ImageEffect";

export default class DayForNightEffect implements CanvasEffect {
  constructor(private adjustment = 1) {}

  public async render(canvas: HTMLCanvasElement) {
    console.info("DayForNight: render");
    this.draw(canvas, this.adjustment);
  }

  public async resize(canvas: HTMLCanvasElement) {
    console.info("DayForNight: resize");
    this.draw(canvas, this.adjustment);
  }

  public async update() {}

  private draw(canvas: HTMLCanvasElement, adjustment: number) {
    const context = canvas.getContext("2d");
    if (!context) return;

    const pixels = this.getPixels(context);
    if (!pixels) return;
    const newPixels = this.dayForNight(pixels, -30 *(1- adjustment));
    this.putPixels(context, newPixels);
  }

  private getPixels(ctx: CanvasRenderingContext2D) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private putPixels(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    return ctx.putImageData(imageData, 0, 0);
  }

  private dayForNight(pixels: ImageData, adjustment = -30) {
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
