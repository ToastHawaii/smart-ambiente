import times from "./times";
import createCanvas from "./create-canvas";
import { random, chance } from "./random";

let dropSize = 64;
const Drop = {
  x: 0,
  y: 0,
  r: 0,
  spreadX: 0,
  spreadY: 0,
  momentum: 0,
  momentumX: 0,
  lastSpawn: 0,
  nextSpawn: 0,
  parent: undefined,
  isNew: true,
  killed: false,
  shrink: 0
};
const defaultOptions = {
  minR: 10,
  maxR: 40,
  maxDrops: 900,
  rainChance: 0.3,
  rainLimit: 3,
  dropletsRate: 50,
  dropletsSize: [2, 4],
  dropletsCleaningRadiusMultiplier: 0.43,
  raining: true,
  globalTimeScale: 1,
  trailRate: 1,
  autoShrink: true,
  spawnArea: [-0.1, 0.95],
  trailScaleRange: [0.2, 0.5],
  collisionRadius: 0.65,
  collisionRadiusIncrease: 0.01,
  dropFallMultiplier: 1,
  collisionBoostMultiplier: 0.05,
  collisionBoost: 1
};

function Raindrops(
  this: any,
  width: number,
  height: number,
  scale: number,
  dropAlpha: any,
  dropColor: any,
  options = {}
) {
  this.width = width;
  this.height = height;
  this.scale = scale;
  this.dropAlpha = dropAlpha;
  this.dropColor = dropColor;
  this.options = (Object as any).assign({}, defaultOptions, options);
  this.init();
}
Raindrops.prototype = {
  dropColor: undefined,
  dropAlpha: undefined,
  canvas: undefined,
  ctx: undefined,
  width: 0,
  height: 0,
  scale: 0,
  dropletsPixelDensity: 1,
  droplets: undefined,
  dropletsCtx: undefined,
  dropletsCounter: 0,
  drops: undefined,
  dropsGfx: undefined,
  clearDropletsGfx: undefined,
  textureCleaningIterations: 0,
  lastRender: undefined,

  options: undefined,

  init() {
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d");

    this.droplets = createCanvas(
      this.width * this.dropletsPixelDensity,
      this.height * this.dropletsPixelDensity
    );
    this.dropletsCtx = this.droplets.getContext("2d");

    this.drops = [];
    this.dropsGfx = [];

    this.renderDropsGfx();

    this.update();
  },
  get deltaR() {
    return this.options.maxR - this.options.minR;
  },
  get area() {
    return (this.width * this.height) / this.scale;
  },
  get areaMultiplier() {
    return Math.sqrt(this.area / (1024 * 768));
  },
  drawDroplet(x: number, y: number, r: number) {
    this.drawDrop(
      this.dropletsCtx,
      (Object as any).assign(Object.create(Drop), {
        x: x * this.dropletsPixelDensity,
        y: y * this.dropletsPixelDensity,
        r: r * this.dropletsPixelDensity
      })
    );
  },

  renderDropsGfx() {
    let dropBuffer = createCanvas(dropSize, dropSize);
    let dropBufferCtx: any = dropBuffer.getContext("2d");
    this.dropsGfx = Array.apply(undefined, Array(255)).map(
      (_cur: any, i: any) => {
        let drop = createCanvas(dropSize, dropSize);
        let dropCtx: any = drop.getContext("2d");

        dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

        // color
        dropBufferCtx.globalCompositeOperation = "source-over";
        dropBufferCtx.drawImage(this.dropColor, 0, 0, dropSize, dropSize);

        // blue overlay, for depth
        dropBufferCtx.globalCompositeOperation = "screen";
        dropBufferCtx.fillStyle = "rgba(0,0," + i + ",1)";
        dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

        // alpha
        dropCtx.globalCompositeOperation = "source-over";
        dropCtx.drawImage(this.dropAlpha, 0, 0, dropSize, dropSize);

        dropCtx.globalCompositeOperation = "source-in";
        dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
        return drop;
      }
    );

    // create circle that will be used as a brush to remove droplets
    this.clearDropletsGfx = createCanvas(128, 128);
    let clearDropletsCtx = this.clearDropletsGfx.getContext("2d");
    clearDropletsCtx.fillStyle = "#000";
    clearDropletsCtx.beginPath();
    clearDropletsCtx.arc(64, 64, 64, 0, Math.PI * 2);
    clearDropletsCtx.fill();
  },
  drawDrop(ctx: any, drop: any) {
    if (this.dropsGfx.length > 0) {
      let x = drop.x;
      let y = drop.y;
      let r = drop.r;
      let spreadX = drop.spreadX;
      let spreadY = drop.spreadY;

      let scaleX = 1;
      let scaleY = 1.5;

      let d = Math.max(
        0,
        Math.min(1, ((r - this.options.minR) / this.deltaR) * 0.9)
      );
      d *= 1 / ((drop.spreadX + drop.spreadY) * 0.5 + 1);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      d = Math.floor(d * (this.dropsGfx.length - 1));
      ctx.drawImage(
        this.dropsGfx[d],
        (x - r * scaleX * (spreadX + 1)) * this.scale,
        (y - r * scaleY * (spreadY + 1)) * this.scale,
        r * 2 * scaleX * (spreadX + 1) * this.scale,
        r * 2 * scaleY * (spreadY + 1) * this.scale
      );
    }
  },
  clearDroplets(x: number, y: number, r = 30) {
    let ctx = this.dropletsCtx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(
      this.clearDropletsGfx,
      (x - r) * this.dropletsPixelDensity * this.scale,
      (y - r) * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale,
      r * 2 * this.dropletsPixelDensity * this.scale * 1.5
    );
  },
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },
  createDrop(options: any) {
    if (this.drops.length >= this.options.maxDrops * this.areaMultiplier)
      return undefined;

    return (Object as any).assign(Object.create(Drop), options);
  },
  addDrop(drop: any) {
    if (
      this.drops.length >= this.options.maxDrops * this.areaMultiplier ||
      drop === undefined
    )
      return false;

    this.drops.push(drop);
    return true;
  },
  updateRain(timeScale: number) {
    let rainDrops = [];
    if (this.options.raining) {
      let limit = this.options.rainLimit * timeScale * this.areaMultiplier;
      let count = 0;
      while (
        chance(this.options.rainChance * timeScale * this.areaMultiplier) &&
        count < limit
      ) {
        count++;
        let r = random(this.options.minR, this.options.maxR, (n: any) => {
          return Math.pow(n, 3);
        });
        let rainDrop = this.createDrop({
          x: random(this.width / this.scale),
          y: random(
            (this.height / this.scale) * this.options.spawnArea[0],
            (this.height / this.scale) * this.options.spawnArea[1]
          ),
          r: r,
          momentum: 1 + (r - this.options.minR) * 0.1 + random(2),
          spreadX: 1.5,
          spreadY: 1.5
        });
        if (rainDrop !== undefined) {
          rainDrops.push(rainDrop);
        }
      }
    }
    return rainDrops;
  },
  clearDrops() {
    this.drops.forEach((drop: any) => {
      setTimeout(() => {
        drop.shrink = 0.1 + random(0.5);
      }, random(1200));
    });
    this.clearTexture();
  },
  clearTexture() {
    this.textureCleaningIterations = 50;
  },
  updateDroplets(timeScale: number) {
    if (this.textureCleaningIterations > 0) {
      this.textureCleaningIterations -= 1 * timeScale;
      this.dropletsCtx.globalCompositeOperation = "destination-out";
      this.dropletsCtx.fillStyle = "rgba(0,0,0," + 0.05 * timeScale + ")";
      this.dropletsCtx.fillRect(
        0,
        0,
        this.width * this.dropletsPixelDensity,
        this.height * this.dropletsPixelDensity
      );
    }
    if (this.options.raining) {
      this.dropletsCounter +=
        this.options.dropletsRate * timeScale * this.areaMultiplier;
      times(this.dropletsCounter, () => {
        this.dropletsCounter--;
        this.drawDroplet(
          random(this.width / this.scale),
          random(this.height / this.scale),
          random(...this.options.dropletsSize, ((n: any) => {
            return (n * n) as any;
          }) as any)
        );
      });
    }
    this.ctx.drawImage(this.droplets, 0, 0, this.width, this.height);
  },
  updateDrops(timeScale: number) {
    let newDrops: any = [];

    this.updateDroplets(timeScale);
    let rainDrops = this.updateRain(timeScale);
    newDrops = newDrops.concat(rainDrops);

    this.drops.sort((a: any, b: any) => {
      let va = a.y * (this.width / this.scale) + a.x;
      let vb = b.y * (this.width / this.scale) + b.x;
      return va > vb ? 1 : va === vb ? 0 : -1;
    });

    this.drops.forEach(function(this: any, drop: any, i: any) {
      if (!drop.killed) {
        // update gravity
        // (chance of drops "creeping down")
        if (
          chance(
            (drop.r - this.options.minR * this.options.dropFallMultiplier) *
              (0.1 / this.deltaR) *
              timeScale
          )
        ) {
          drop.momentum += random((drop.r / this.options.maxR) * 4);
        }
        // clean small drops
        if (
          this.options.autoShrink &&
          drop.r <= this.options.minR &&
          chance(0.05 * timeScale)
        ) {
          drop.shrink += 0.01;
        }
        //update shrinkage
        drop.r -= drop.shrink * timeScale;
        if (drop.r <= 0) drop.killed = true;

        // update trails
        if (this.options.raining) {
          drop.lastSpawn += drop.momentum * timeScale * this.options.trailRate;
          if (drop.lastSpawn > drop.nextSpawn) {
            let trailDrop = this.createDrop({
              x: drop.x + random(-drop.r, drop.r) * 0.1,
              y: drop.y - drop.r * 0.01,
              r: drop.r * random(...this.options.trailScaleRange),
              spreadY: drop.momentum * 0.1,
              parent: drop
            });

            if (trailDrop !== undefined) {
              newDrops.push(trailDrop);

              drop.r *= Math.pow(0.97, timeScale);
              drop.lastSpawn = 0;
              drop.nextSpawn =
                random(this.options.minR, this.options.maxR) -
                drop.momentum * 2 * this.options.trailRate +
                (this.options.maxR - drop.r);
            }
          }
        }

        //normalize spread
        drop.spreadX *= Math.pow(0.4, timeScale);
        drop.spreadY *= Math.pow(0.7, timeScale);

        //update position
        let moved = drop.momentum > 0;
        if (moved && !drop.killed) {
          drop.y += drop.momentum * this.options.globalTimeScale;
          drop.x += drop.momentumX * this.options.globalTimeScale;
          if (drop.y > this.height / this.scale + drop.r) {
            drop.killed = true;
          }
        }

        // collision
        let checkCollision = (moved || drop.isNew) && !drop.killed;
        drop.isNew = false;

        if (checkCollision) {
          this.drops.slice(i + 1, i + 70).forEach((drop2: any) => {
            //basic check
            if (
              drop !== drop2 &&
              drop.r > drop2.r &&
              drop.parent !== drop2 &&
              drop2.parent !== drop &&
              !drop2.killed
            ) {
              let dx = drop2.x - drop.x;
              let dy = drop2.y - drop.y;
              let d = Math.sqrt(dx * dx + dy * dy);
              //if it's within acceptable distance
              if (
                d <
                (drop.r + drop2.r) *
                  (this.options.collisionRadius +
                    drop.momentum *
                      this.options.collisionRadiusIncrease *
                      timeScale)
              ) {
                let pi = Math.PI;
                let r1 = drop.r;
                let r2 = drop2.r;
                let a1 = pi * (r1 * r1);
                let a2 = pi * (r2 * r2);
                let targetR = Math.sqrt((a1 + a2 * 0.8) / pi);
                if (targetR > this.maxR) {
                  targetR = this.maxR;
                }
                drop.r = targetR;
                drop.momentumX += dx * 0.1;
                drop.spreadX = 0;
                drop.spreadY = 0;
                drop2.killed = true;
                drop.momentum = Math.max(
                  drop2.momentum,
                  Math.min(
                    40,
                    drop.momentum +
                      targetR * this.options.collisionBoostMultiplier +
                      this.options.collisionBoost
                  )
                );
              }
            }
          });
        }

        //slowdown momentum
        drop.momentum -=
          Math.max(1, this.options.minR * 0.5 - drop.momentum) *
          0.1 *
          timeScale;
        if (drop.momentum < 0) drop.momentum = 0;
        drop.momentumX *= Math.pow(0.7, timeScale);

        if (!drop.killed) {
          newDrops.push(drop);
          if (moved && this.options.dropletsRate > 0)
            this.clearDroplets(
              drop.x,
              drop.y,
              drop.r * this.options.dropletsCleaningRadiusMultiplier
            );
          this.drawDrop(this.ctx, drop);
        }
      }
    }, this);

    this.drops = newDrops;
  },
  update() {
    this.clearCanvas();

    let now = Date.now();
    if (this.lastRender === undefined) this.lastRender = now;
    let deltaT = now - this.lastRender;
    let timeScale = deltaT / ((1 / 60) * 1000);
    if (timeScale > 1.1) timeScale = 1.1;
    timeScale *= this.options.globalTimeScale;
    this.lastRender = now;

    this.updateDrops(timeScale);

    requestAnimationFrame(this.update.bind(this));
  }
};

export default Raindrops;