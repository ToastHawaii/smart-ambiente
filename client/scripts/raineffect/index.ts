import "core-js";
import RainRenderer from "./rain-renderer";
import Raindrops from "./raindrops";
import loadImages from "./image-loader";
import createCanvas from "./create-canvas";
import { Quint, TweenLite } from "gsap";

let src: HTMLImageElement | HTMLVideoElement;

let dropColor: any;
let dropAlpha: any;

let textureFg: HTMLCanvasElement;
let textureFgCtx: CanvasRenderingContext2D | null;
let textureBg: HTMLCanvasElement;
let textureBgCtx: CanvasRenderingContext2D | null;

let textureBgSize = {
  width: 0,
  height: 0
};

let textureFgSize = {
  width: 0,
  height: 0
};

let raindrops;
let renderer: any;
let canvas: HTMLCanvasElement;

let parallax = { x: 0, y: 0 };

export default function loadTextures(
  s: HTMLImageElement | HTMLVideoElement,
  c: HTMLCanvasElement,
  level = 1
) {
  src = s;
  canvas = c;
  (loadImages as any)([
    { name: "dropAlpha", src: "img/rain/drop-alpha.png" },
    { name: "dropColor", src: "img/rain/drop-color.png" }
  ]).then((images: any) => {
    if (isHTMLImageElement(src)) {
      textureFgSize.width = src.naturalWidth;
      textureFgSize.height = src.naturalHeight;
      textureBgSize.width = src.naturalWidth;
      textureBgSize.height = src.naturalHeight;
    } else {
      textureFgSize.width = src.videoWidth;
      textureFgSize.height = src.videoHeight;
      textureBgSize.width = src.videoWidth;
      textureBgSize.height = src.videoHeight;
    }

    dropColor = images.dropColor.img;
    dropAlpha = images.dropAlpha.img;

    init(level);
  });
}

function isHTMLImageElement(
  element: HTMLImageElement | HTMLVideoElement
): element is HTMLImageElement {
  return (
    element.tagName.toUpperCase() === "IMG" &&
    !element.src.toUpperCase().endsWith(".GIF")
  );
}

function init(level: number) {
  let dpi = window.devicePixelRatio;
  canvas.width = window.innerWidth * dpi;
  canvas.height = window.innerHeight * dpi;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  raindrops = new (Raindrops as any)(
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

  textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
  textureFgCtx = textureFg.getContext("2d");
  textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
  textureBgCtx = textureBg.getContext("2d");

  generateTextures();

  renderer = new (RainRenderer as any)(
    canvas,
    raindrops.canvas,
    textureFg,
    textureBg,
    undefined,
    {
      brightness: 1.04,
      alphaMultiply: 6,
      alphaSubtract: 3
      // minRefraction:256,
      // maxRefraction:512
    }
  );

  setupEvents();
}

function setupEvents() {
  if (!isHTMLImageElement(src)) updateTextures();
  setupParallax();
}
function setupParallax() {
  document.addEventListener("mousemove", event => {
    let x = event.pageX;
    let y = event.pageY;

    TweenLite.to(parallax, 1, {
      x: (x / canvas.width) * 2 - 1,
      y: (y / canvas.height) * 2 - 1,
      ease: Quint.easeOut,
      onUpdate: () => {
        renderer.parallaxX = parallax.x;
        renderer.parallaxY = parallax.y;
      }
    });
  });
}
function updateTextures() {
  generateTextures();
  renderer.updateTextures();
  requestAnimationFrame(updateTextures);
}
function generateTextures() {
  if (textureFgCtx) {
    textureFgCtx.globalAlpha = 1;
    textureFgCtx.drawImage(
      src,
      0,
      0,
      textureFgSize.width,
      textureFgSize.height
    );
  }
  if (textureBgCtx) {
    textureBgCtx.globalAlpha = 1;
    textureBgCtx.drawImage(
      src,
      0,
      0,
      textureBgSize.width,
      textureBgSize.height
    );
  }
}
