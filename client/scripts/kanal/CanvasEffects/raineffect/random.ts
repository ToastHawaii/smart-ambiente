export function random(
  from: number | undefined = undefined,
  to: number | undefined = undefined,
  interpolation: ((n: number) => number) | undefined = undefined
) {
  if (from === undefined) {
    from = 0;
    to = 1;
  } else if (from !== undefined && to === undefined) {
    to = from;
    from = 0;
  }
  if (to === undefined) to = 0;

  const delta = to - from;

  if (interpolation === undefined) {
    interpolation = (n: number) => {
      return n;
    };
  }
  return from + interpolation(Math.random()) * delta;
}
export function chance(c: number) {
  return random() <= c;
}
