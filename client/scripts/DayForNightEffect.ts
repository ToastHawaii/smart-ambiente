let src: HTMLImageElement | HTMLVideoElement;
let canvas: HTMLCanvasElement;

export default function render(
  s: HTMLImageElement | HTMLVideoElement,
  c: HTMLCanvasElement,
  adjustment = 1
) {
  src = s;
  canvas = c;

  let dpi = window.devicePixelRatio;
  let canvasWidth = window.innerWidth * dpi;
  let canvasHeight = window.innerHeight * dpi;

  let imageWidth: number;
  let imageHeight: number;
  if (isHTMLImageElement(src)) {
    imageWidth = src.naturalWidth;
    imageHeight = src.naturalHeight;
  } else {
    imageWidth = src.videoWidth;
    imageHeight = src.videoHeight;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  let context = canvas.getContext("2d");

  if (!context) return;
  context.drawImage(src, 0, 0, imageWidth, imageHeight);
  let pixels = getPixels();
  if (!pixels) return;
  let newPixels = dayForNight(pixels, -30 * adjustment);
  putPixels(newPixels);
}

function getPixels() {
  let c = canvas;
  let ctx = c.getContext("2d");
  if (!ctx) return undefined;

  return ctx.getImageData(0, 0, c.width, c.height);
}

function putPixels(imageData: ImageData) {
  let c = canvas;
  let ctx = c.getContext("2d");

  if (!ctx) return undefined;
  return ctx.putImageData(imageData, 0, 0);
}

function dayForNight(pixels: ImageData, adjustment = -30) {
  let d = pixels.data;
  // These values serve as thresholds for the darkest and brightest possible values when
  // applying the 'blue-biased' desaturation. In the for loop below, no single RBG value
  // shall be less than `min` or greater than `max`.
  let min = 0;
  let max = 120;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    let v = 0.2126 * r + 0.07152 * g + 0.0722 * b;
    d[i] = Math.max(min, v);
    d[i + 1] = Math.max(min, v);
    d[i + 2] = Math.max(min, (0.7 * b + v) / 2);
    d[i] = Math.min(max, d[i]);
    d[i + 1] = Math.min(max, d[i + 1]);
    d[i + 2] = Math.min(max, d[i + 2]);
  }
  return brightness(pixels, adjustment);
}

function brightness(pixels: ImageData, adjustment: number) {
  let d = pixels.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] += adjustment;
    d[i + 1] += adjustment;
    d[i + 2] += adjustment;
  }
  return pixels;
}

function isHTMLImageElement(element: Element): element is HTMLImageElement {
  return element.tagName.toUpperCase() === "IMG";
}
