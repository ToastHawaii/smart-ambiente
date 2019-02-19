import { CanvasEffect } from "./ImageEffect";
import { Gif, parseGif, seek } from "./gif";
import { getRandomInt } from "../../utils";

export default class RandomAnimatedImageEffect implements CanvasEffect {
  constructor(
    private src: string,
    private timeoutFrom: number = 0,
    private timeoutTo: number = 0
  ) {}

  private draw(
    image: HTMLCanvasElement,
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

    const iw = image.width;
    const ih = image.height;
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

  private images: Gif;

  public async render(canvas: HTMLCanvasElement) {
    console.info("AnimatedImageEffect: render " + this.src);

    this.images = await parseGif(this.src);
    // will work as well but not needed as GIF() returns the correct reference already.
    this.draw(this.images.frames[0].image, canvas); //event.path array containing a reference to the gif
  }
  private time = 0;
  private timeout = 0;

  public step(
    canvas: HTMLCanvasElement,
    deltaT: number,
    _underlyingCanvas: HTMLCanvasElement[]
  ) {
    if (!this.images) return;

    if (this.timeout > 0) this.timeout -= deltaT;
    else this.time += deltaT;

    if (this.time >= this.images.length) {
      this.timeout = getRandomInt(
        this.timeoutFrom * 1000,
        this.timeoutTo * 1000
      );
      this.time = this.time % this.images.length;
    }

    const currentFrame = seek(this.images, this.time);

    this.draw(this.images.frames[currentFrame].image, canvas); //event.path array containing a reference to the gif
  }
}
