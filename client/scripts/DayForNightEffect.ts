export default function render(
  src: HTMLImageElement | HTMLVideoElement,
  canvas: HTMLCanvasElement,
  adjustment = 1
) {
  let imageWidth: number;
  let imageHeight: number;
  if (isHTMLImageElement(src)) {
    imageWidth = src.naturalWidth;
    imageHeight = src.naturalHeight;
  } else {
    imageWidth = src.videoWidth;
    imageHeight = src.videoHeight;
  }

  canvas.width = imageWidth;
  canvas.height = imageHeight;
  const context = canvas.getContext("2d");

  if (!context) return;
  context.drawImage(src, 0, 0, imageWidth, imageHeight);
  const pixels = getPixels(canvas);
  if (!pixels) return;
  const newPixels = dayForNight(pixels, -25 * adjustment);
  putPixels(canvas, newPixels);
}

function getPixels(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return undefined;

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function putPixels(canvas: HTMLCanvasElement, imageData: ImageData) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return undefined;

  return ctx.putImageData(imageData, 0, 0);
}

function dayForNight(pixels: ImageData, adjustment = -25) {
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
  return brightness(pixels, adjustment);
}

function brightness(pixels: ImageData, adjustment: number) {
  const d = pixels.data;
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
