export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function percent(part: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((part / total) * 100);
}
