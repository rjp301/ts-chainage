export default function formatKP(value: number): string {
  const post_plus = Math.round(value % 1000);
  const pre_plus = Math.trunc((value - post_plus) / 1000);
  return `${Math.max(0, pre_plus)}+${String(post_plus).padStart(3, "0")}`;
}
