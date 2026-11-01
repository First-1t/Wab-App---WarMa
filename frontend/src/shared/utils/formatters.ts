/**
 * Shared Number and Agricultural Metric Formatters
 */

export function formatTons(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  return val.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatM3(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('th-TH');
}

export function formatPercent(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatRai(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return val.toLocaleString('th-TH');
}
