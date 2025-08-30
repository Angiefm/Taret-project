export function normalizeDate(input: string | Date | null | undefined): string {
  if (!input) return '';

  if (input instanceof Date) {
    const year = input.getFullYear();
    const month = input.getMonth(); // 0-based
    const day = input.getDate();
    return new Date(Date.UTC(year, month, day, 12, 0, 0, 0)).toISOString();
  }

  const str = String(input);

  if (str.includes('T')) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  }

  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return '';

  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0)).toISOString();
}

export function toDateOnlyString(isoString: string | null | undefined): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function diffInNights(checkInIso: string, checkOutIso: string): number {
  const inDate = new Date(checkInIso);
  const outDate = new Date(checkOutIso);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;
  const diffMs = outDate.getTime() - inDate.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
