import { CanvasEffect } from "./ImageEffect";
import { imageFromSource } from "../../utils";

export default class StarsEffect implements CanvasEffect {
  constructor(
    private src: string,
    private top: number = 0,
    private right: number = 0,
    private bottom: number = 0,
    private left: number = 0
  ) {}

  private toAbsoluteValue(image: HTMLImageElement, canvas: HTMLCanvasElement) {
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (canvasWidth / imageWidth > canvasHeight / imageHeight) {
      const scale = canvasWidth / imageWidth;
      return {
        left: imageWidth * this.left * scale,
        top: imageHeight * this.top * scale,
        right: imageWidth * this.right * scale,
        bottom: imageHeight * this.bottom * scale
      };
    } else {
      const scale = canvasHeight / imageHeight;
      return {
        left: imageWidth * this.left * scale,
        top: imageHeight * this.top * scale,
        right: imageWidth * this.right * scale,
        bottom: imageHeight * this.bottom * scale
      };
    }
  }

  private crop(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    margins: { top: number; right: number; bottom: number; left: number }
  ) {
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (canvasWidth / imageWidth > canvasHeight / imageHeight) {
      const scale = canvasWidth / imageWidth;
      const offset = (imageHeight * scale - canvasHeight) / 2;
      return {
        top: margins.top - offset,
        right: margins.right,
        bottom: margins.bottom - offset,
        left: margins.left
      };
    } else {
      const scale = canvasHeight / imageHeight;
      const offset = (imageWidth * scale - canvasWidth) / 2;
      return {
        top: margins.top,
        right: margins.right - offset,
        bottom: margins.bottom,
        left: margins.left - offset
      };
    }
  }

  private convertToLeftTopWidthHeight(
    canvas: HTMLCanvasElement,
    margins: { top: number; right: number; bottom: number; left: number }
  ) {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    return {
      top: margins.top,
      width: canvasWidth - margins.left - margins.right,
      height: canvasHeight - margins.top - margins.bottom,
      left: margins.left
    };
  }

  public async render(canvas: HTMLCanvasElement) {
    console.info("Stars: render " + this.src);
    const image = await imageFromSource(this.src);
    let margins = this.toAbsoluteValue(image, canvas);
    margins = this.crop(image, canvas, margins);
    const pos = this.convertToLeftTopWidthHeight(canvas, margins);
    stars(canvas, 0.8, pos.left, pos.top, pos.width, pos.height);
  }
}

function stars(
  canvas: HTMLCanvasElement,
  opacity: number,
  left: number,
  top: number,
  width: number,
  height: number
) {
  const stars = canvas.getContext("2d");
  if (!stars) return;

  let x;
  let y;
  let colornum;
  let inc = 1;
  for (x = left; x < left + width; x = x + inc) {
    for (y = top; y < top + height; y = y + inc) {
      // loop to determine the colornum of stars
      const weight = Math.floor(Math.random() * 2000 + 1);
      if (weight > 1999) {
        // if series to determine what color and the percentage of each color the stars are
        const weight2 = Math.floor(Math.random() * 25 + 1);
        const lowpass = 0;
        // white
        if (weight2 >= 1 && weight2 <= 22) {
          colornum = Math.floor(Math.random() * 255 + 1);
          stars.fillStyle =
            "rgba(" +
            colornum +
            "," +
            colornum +
            "," +
            colornum +
            "," +
            opacity +
            ")";
          stars.fillRect(x, y, inc, inc);
        }
        // blue
        else if (weight2 === 23) {
          colornum = Math.floor(Math.random() * 255 + 1);
          stars.fillStyle =
            "rgba(" +
            lowpass +
            "," +
            lowpass +
            "," +
            colornum +
            "," +
            opacity +
            ")";
          stars.fillRect(x, y, inc, inc);
        }
        // red
        else if (weight2 === 24) {
          colornum = Math.floor(Math.random() * 255 + 1);
          stars.fillStyle =
            "rgba(" +
            colornum +
            "," +
            lowpass +
            "," +
            lowpass +
            "," +
            opacity +
            ")";
          stars.fillRect(x, y, inc, inc);
        }
        // green
        else if (weight2 === 25) {
          colornum = Math.floor(Math.random() * 255 + 1);
          stars.fillStyle =
            "rgba(" +
            lowpass +
            "," +
            colornum +
            "," +
            lowpass +
            "," +
            opacity +
            ")";
          stars.fillRect(x, y, inc, inc);
        }
      }
    }
  }
}
