export function normalizeSupportEmail(value: string): string | null {
  const match = value.trim().match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}\b/i);
  if (!match || match[0].length > 254) return null;
  const email = match[0].toLowerCase();
  if (email.includes("..") || email.startsWith(".") || email.endsWith(".")) return null;
  return email;
}
