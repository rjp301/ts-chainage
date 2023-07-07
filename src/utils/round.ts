export default function round(num: number, digits = 3): number {
  const multi = Math.pow(10, digits);
  return Math.round(num * multi) / multi;
}
