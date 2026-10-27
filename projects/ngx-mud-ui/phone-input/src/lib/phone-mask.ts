import type { MudPhoneCountry } from './phone-countries';

/** Everything that is not a digit, discarded. */
export function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

export function applyMask(value: string, country: MudPhoneCountry): string {
  const digits = digitsOf(value).slice(0, country.maxDigits);

  if (!digits) return '';

  let out = '';
  let next = 0;

  for (const slot of country.mask) {
    if (next >= digits.length) break;

    if (slot === 'X') {
      out += digits[next];
      next += 1;
    } else {
      out += slot;
    }
  }

  return out;
}

export function nationalOf(value: string, country: MudPhoneCountry): string {
  const digits = digitsOf(value);
  const code = digitsOf(country.dialCode);

  return digits.startsWith(code) ? digits.slice(code.length) : digits;
}

export function toE164(nationalValue: string, country: MudPhoneCountry): string {
  const digits = digitsOf(nationalValue).slice(0, country.maxDigits);

  return digits ? `${country.dialCode}${digits}` : '';
}

/** True when the national digit count sits inside the country's window. */
export function isComplete(nationalValue: string, country: MudPhoneCountry): boolean {
  const length = digitsOf(nationalValue).length;

  return length >= country.minDigits && length <= country.maxDigits;
}

export function digitsBefore(value: string, caret: number): number {
  return digitsOf(value.slice(0, Math.max(0, caret))).length;
}

/** Offset right after the nth digit, so a re-mask keeps the caret where the user was typing. */
export function caretForDigitIndex(masked: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;

  let seen = 0;

  for (let i = 0; i < masked.length; i += 1) {
    if (!/\d/.test(masked[i])) continue;

    seen += 1;

    if (seen === digitIndex) return i + 1;
  }

  return masked.length;
}
