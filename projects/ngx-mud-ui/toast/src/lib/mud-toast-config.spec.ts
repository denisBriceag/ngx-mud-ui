import { describe, expect, it } from 'vitest';
import { MUD_TOAST_FALLBACK_OPTIONS, resolveToastConfig } from './mud-toast-config';

describe('resolveToastConfig', () => {
  it('fills every unset field from the library fallbacks', () => {
    const resolved = resolveToastConfig({ data: { message: 'Salvat' } });

    expect(resolved.variant).toBe('info');
    expect(resolved.duration).toBe(4000);
    expect(resolved.pauseOnHover).toBe(true);
    expect(resolved.horizontalPosition).toBe('end');
    expect(resolved.verticalPosition).toBe('top');
    expect(resolved.showCloseButton).toBe(true);
    expect(resolved.closeLabel).toBe('Close');
    expect(resolved.announcementMessage).toBeUndefined();
  });

  it('lets an explicit config beat app defaults, and app defaults beat fallbacks', () => {
    const resolved = resolveToastConfig(
      { data: { message: 'Eroare' }, variant: 'error' },
      { variant: 'warning', duration: 9000, maxVisible: 5 },
    );

    expect(resolved.variant).toBe('error'); // explicit wins
    expect(resolved.duration).toBe(9000); // app default wins over fallback
    expect(resolved.closeLabel).toBe('Close'); // fallback fills the rest
  });

  it('keeps duration 0 rather than treating it as unset', () => {
    expect(resolveToastConfig({ data: { message: 'x' }, duration: 0 }).duration).toBe(0);
  });

  it('trims closeLabel and falls back when it is blank', () => {
    expect(resolveToastConfig({ data: { message: 'x' }, closeLabel: '  Închide  ' }).closeLabel).toBe('Închide');
    expect(resolveToastConfig({ data: { message: 'x' }, closeLabel: '   ' }).closeLabel).toBe('Close');
  });

  it('exposes maxVisible 3 as the fallback', () => {
    expect(MUD_TOAST_FALLBACK_OPTIONS.maxVisible).toBe(3);
  });
});
