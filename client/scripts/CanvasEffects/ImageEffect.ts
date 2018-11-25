export interface CanvasEffect {
  render(): void;
  update(delta?: number): void;
}

export default class ImageEffect implements CanvasEffect {
  constructor(
    private image: HTMLImageElement,
    private canvasContext: CanvasRenderingContext2D
  ) {}

  private draw(
    image: HTMLImageElement,
    canvasContext: CanvasRenderingContext2D,
    x = 0,
    y = 0,
    w = canvasContext.canvas.width,
    h = canvasContext.canvas.height,
    offsetX = 0.5,
    offsetY = 0.5
  ) {
    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = image.naturalWidth;
    let ih = image.naturalHeight;
    let r = Math.min(w / iw, h / ih);
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

    // fill image in dest. rectangle
    canvasContext.drawImage(image, cx, cy, cw, ch, x, y, w, h);
  }

  public render() {
    this.draw(this.image, this.canvasContext);
  }

  public update() {
    this.draw(this.image, this.canvasContext);
  }
}
