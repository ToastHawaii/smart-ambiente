export function relative(value: number, refValue: number, targetValue: number) {
  if (value >= refValue)
    return Math.round(
      (100 - targetValue) * (1 / (100 - refValue)) * (value - refValue) +
      targetValue
    );
  else
    return Math.round(
      targetValue * (1 / refValue) * (value - refValue) + targetValue
    );
}

export function midrange(...values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (min + max) / 2;
}

export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function xyzToXy({ X, Y, Z }: { X: number; Y: number; Z: number; }): [number, number] {

  Y = Y;
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);

  return [x, y];
}

export function rgbToXyz({ r, g, b }: { r: number; g: number; b: number; }) {
  //sR, sG and sB (Standard RGB) input range = 0 ÷ 255
  //X, Y and Z output refer to a D65/2° standard illuminant.

  let R = (r / 255);
  let G = (g / 255);
  let B = (b / 255);

  if (R > 0.04045) R = Math.pow(((R + 0.055) / 1.055), 2.4);
  else R = R / 12.92;
  if (G > 0.04045) G = Math.pow(((G + 0.055) / 1.055), 2.4);
  else G = G / 12.92;
  if (B > 0.04045) B = Math.pow(((B + 0.055) / 1.055), 2.4);
  else B = B / 12.92;

  R = R * 100;
  G = G * 100;
  B = B * 100;

  let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  return { X: X, Y: Y, Z: Z };
}

export function hexToRgb(h: string) {
  let r = 0;
  let g = 0;
  let b = 0;

  // 3 digits
  if (h.length === 4) {
    r = +("0x" + h[1] + h[1]);
    g = +("0x" + h[2] + h[2]);
    b = +("0x" + h[3] + h[3]);

    // 6 digits
  } else if (h.length === 7) {
    r = +("0x" + h[1] + h[2]);
    g = +("0x" + h[3] + h[4]);
    b = +("0x" + h[5] + h[6]);
  }

  return {
    r: r,
    g: g,
    b: b
  };

}

export function hexToXy(hex: string) {
  return xyzToXy(rgbToXyz(hexToRgb(hex)));
}