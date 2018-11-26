import "core-js";
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import loadImages from "./image-loader";

let dropColor: HTMLImageElement;
let dropAlpha: HTMLImageElement;

let raindrops;
let canvas: HTMLCanvasElement;

export default function loadTextures(
  texture: HTMLCanvasElement,
  c: HTMLCanvasElement,
  level = 1
) {
  canvas = c;
  (loadImages as any)([
    { name: "dropAlpha", src: "img/rain/drop-alpha.png" },
    { name: "dropColor", src: "img/rain/drop-color.png" }
  ]).then((images: any) => {
    dropColor = images.dropColor.img;
    dropAlpha = images.dropAlpha.img;

    init(texture, level);
  });
}

function init(texture: HTMLCanvasElement, level: number) {
  let dpi = window.devicePixelRatio;

  raindrops = new Raindrops(
    canvas.width,
    canvas.height,
    dpi,
    dropAlpha,
    dropColor,
    {
      trailRate: 1,
      trailScaleRange: [0.2, 0.45],
      collisionRadius: 0.45,
      dropletsCleaningRadiusMultiplier: 0.28,

      maxDrops: 900 * level,
      rainChance: 0.3 * level
    }
  );

  new RainRenderer(canvas, raindrops.canvas, texture, undefined, {
    brightness: 1.04,
    alphaMultiply: 6,
    alphaSubtract: 3
    // minRefraction:256,
    // maxRefraction:512
  });
}
