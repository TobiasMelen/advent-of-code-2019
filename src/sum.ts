export default function sum<T>(source: T[], fn: (item: T) => number) {
  return source.reduce((sum, item) => sum + fn(item), 0);
}
