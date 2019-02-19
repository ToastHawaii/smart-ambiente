import "core-js";
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import { imageFromSource } from "../../../utils";

export default async function init(
  texture: HTMLCanvasElement,
  canvas: HTMLCanvasElement,
  level: number = 1
) {
  const dpi = window.devicePixelRatio;

  const dropColor = await imageFromSource("img/rain/drop-color.png");
  const dropAlpha = await imageFromSource("img/rain/drop-alpha.png");

  const raindrops = new Raindrops(
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

 new RainRenderer(
    canvas,
    raindrops.canvas,
    texture,
    undefined,
    {
      brightness: 1.04,
      alphaMultiply: 6,
      alphaSubtract: 3
      // minRefraction:256,
      // maxRefraction:512
    }
  );
}
