import { imageFromSource } from "../utils";

export interface CanvasEffect {
  render(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ): Promise<void>;

  update(
    canvas: HTMLCanvasElement,
    deltaT: number,
    underlyingCanvas: HTMLCanvasElement[]
  ): Promise<void>;

  resize(
    canvas: HTMLCanvasElement,
    underlyingCanvas: HTMLCanvasElement[]
  ): Promise<void>;
}

export default class ImageEffect implements CanvasEffect {
  constructor(private src: string) {}

  private draw(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    x = 0,
    y = 0,
    w = canvas.width,
    h = canvas.height,
    offsetX = 0.5,
    offsetY = 0.5
  ) {
    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const r = Math.min(w / iw, h / ih);
    let nw = iw * r;
    let nh = ih * r;
    let cx;
    let cy;
    let cw;
    let ch;
    let ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    // fill image in dest. rectangle
    canvasContext.drawImage(image, cx, cy, cw, ch, x, y, w, h);
  }

  public async render(canvas: HTMLCanvasElement) {
    console.info("Image: render " + this.src);
    const image = await imageFromSource(this.src);
    this.draw(image, canvas);
  }

  public async update() {}

  public async resize(canvas: HTMLCanvasElement) {
    await this.render(canvas);
  }
}
