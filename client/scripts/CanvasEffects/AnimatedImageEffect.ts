import { CanvasEffect } from "./ImageEffect";
import GIF, { Image } from "./gif";

export default class AnimatedImageEffect implements CanvasEffect {
  constructor(private src: string) {}

  public automaticUpdates = true;

  private draw(
    image: Image,
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

  private images: GIF;

  public render(canvas: HTMLCanvasElement) {
    return new Promise<void>(resolve => {
      console.info("AnimatedImageEffect: render " + this.src);

      let myGif = new GIF(); // will work as well but not needed as GIF() returns the correct reference already.
      myGif.load(this.src); // set URL and load
      myGif.onload = () => {
        // fires when loading is complete
        //event.type   = "load"
        this.images = myGif;

        if (this.images.image) this.draw(this.images.image, canvas); //event.path array containing a reference to the gif

        resolve();
      };

      //  this.draw(this.images[0], canvas);
    });
  }
  public step(
    canvas: HTMLCanvasElement,
    _deltaT: number,
    _underlyingCanvas: HTMLCanvasElement[]
  ) {
    if (this.images && this.images.image) this.draw(this.images.image, canvas); //event.path array containing a reference to the gif
  }
}
