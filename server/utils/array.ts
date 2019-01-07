export function toArray<O extends { [index: string]: T }, T>(o: O) {
  const a: (T & { id: string })[] = [];
  for (const p in o) {
    const i = (o[p] as any) as T & { id: string };
    i.id = p;
    a.push(i);
  }
  return a;
}

export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export function split<T>(inputArray: T[], numberOfChunks: number) {
  const perChunk = Math.ceil(inputArray.length / numberOfChunks);

  return inputArray.reduce<T[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
}

export function sortAlternate<T extends { random: string }>(a: T[]) {
  a.sort((a, b) => parseFloat(a.random) - parseFloat(b.random));
  const b = [];

  const l = a.length - 1; // micro optimization
  const L = l / 2; // micro optimization
  let i;
  for (i = 0; i < L; i++) b.push(a[l - i], a[i]);
  if (a.length % 2) b.push(a[i]); // add last item in odd arrays

  return b;
}

export function flatten<T>(arr: T[][]): T[] {
  return [].concat.apply([], arr);
}
