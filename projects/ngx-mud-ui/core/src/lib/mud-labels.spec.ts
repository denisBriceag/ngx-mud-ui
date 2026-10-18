import { InjectionToken, signal } from '@angular/core';
import type { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { _injectMudLabels, _provideMudLabels } from './mud-labels';

interface SpecLabels {
  open: string;
  close: string;
}

const DEFAULTS: SpecLabels = { open: 'Open', close: 'Close' };

const SPEC_LABELS = new InjectionToken<SpecLabels | Signal<SpecLabels>>('SPEC_LABELS', {
  providedIn: 'root',
  factory: () => DEFAULTS,
});

const read = () => TestBed.runInInjectionContext(() => _injectMudLabels(SPEC_LABELS));

describe('_provideMudLabels + _injectMudLabels', () => {
  it('reads the token default as a signal', () => {
    expect(read()()).toBe(DEFAULTS);
  });

  it('overlays a plain partial on the defaults', () => {
    TestBed.configureTestingModule({ providers: [_provideMudLabels(SPEC_LABELS, DEFAULTS, { open: 'Deschide' })] });

    expect(read()()).toEqual({ open: 'Deschide', close: 'Close' });
  });

  it('follows a signal partial live', () => {
    const partial = signal<Partial<SpecLabels>>({});

    TestBed.configureTestingModule({ providers: [_provideMudLabels(SPEC_LABELS, DEFAULTS, partial)] });

    const labels = read();

    expect(labels().close).toBe('Close');

    partial.set({ close: 'Închide' });

    expect(labels()).toEqual({ open: 'Open', close: 'Închide' });
  });

  it('accepts a factory that returns a signal', () => {
    const partial = signal<Partial<SpecLabels>>({ open: 'Deschide' });

    TestBed.configureTestingModule({ providers: [_provideMudLabels(SPEC_LABELS, DEFAULTS, () => partial)] });

    const labels = read();

    expect(labels().open).toBe('Deschide');

    partial.set({});

    expect(labels().open).toBe('Open');
  });
});
