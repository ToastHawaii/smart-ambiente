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
