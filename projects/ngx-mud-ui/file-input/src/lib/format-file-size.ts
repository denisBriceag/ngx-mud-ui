import type { MudLabels } from 'ngx-mud-ui/i18n';

/** `caption`: up to 1 decimal, trimmed, up to TB. `item`: fixed 1 decimal (KB/MB) and 2 (GB), capped at GB. */
export type MudFileSizePolicy = 'caption' | 'item';

/** Binary-scaled size in the locale's number format: `1.5 MB`, `1,5 МБ`, `1023 B`. */
export function formatFileSize(
  bytes: number,
  locale: string,
  units: MudLabels['fileSize']['units'],
  policy: MudFileSizePolicy = 'caption',
): string {
  const top = policy === 'item' ? 3 : units.length - 1;
  const number = (value: number, unit: number): string => {
    const digits = policy === 'item' ? (unit === 0 ? 0 : unit === 3 ? 2 : 1) : undefined;

    return new Intl.NumberFormat(
      locale,
      digits === undefined
        ? { maximumFractionDigits: 1, useGrouping: false }
        : { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false },
    ).format(value);
  };

  if (!Number.isFinite(bytes) || bytes <= 0) return `${number(0, 0)} ${units[0]}`;

  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < top) {
    value /= 1024;
    unit += 1;
  }

  return `${number(value, unit)} ${units[unit]}`;
}
