export function toArray<O extends { [index: string]: T }, T>(o: O) {
  const a: (T & { id: string })[] = [];
  for (const p in o) {
    const i = (o[p] as any) as T & { id: string };
    i.id = p;
    a.push(i);
  }
  return a;
}
