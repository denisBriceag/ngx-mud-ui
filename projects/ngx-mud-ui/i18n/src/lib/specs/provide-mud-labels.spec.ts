import { Component, inject, InjectionToken, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_EN } from '../mud-labels';
import { injectMudLabels, provideMudLabels, _mudText } from '../provide-mud-labels';

@Component({ selector: 'mud-labels-probe', template: '' })
class Probe {
  readonly labels = injectMudLabels();
}

@Component({ selector: 'mud-labels-host', template: '<mud-labels-probe />', imports: [Probe], providers: [provideMudLabels({ banner: { close: 'C' } })] })
class Host {}

describe('provideMudLabels', () => {
  it('defaults to MUD_LABELS_EN with no provider', () => {
    const labels = TestBed.runInInjectionContext(() => injectMudLabels());

    expect(labels().banner.close).toBe('Close');
    expect(labels()).toBe(MUD_LABELS_EN);
  });

  it('merges partials left to right per namespace', () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels({ banner: { close: 'A' } }, { banner: { close: 'B' }, toast: { close: 'T' } })],
    });
    const labels = TestBed.runInInjectionContext(() => injectMudLabels());

    expect(labels().banner.close).toBe('B');
    expect(labels().toast.close).toBe('T');
    expect(labels().infoBox.close).toBe('Close');
  });

  it('keeps sibling keys of a partially overridden namespace', () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels({ tooltip: { close: 'X' } })] });
    const labels = TestBed.runInInjectionContext(() => injectMudLabels());

    expect(labels().tooltip).toEqual({ close: 'X', coachHint: 'Press Esc to close' });
  });

  it('accepts a signal and updates live', () => {
    const source = signal({ banner: { close: 'X' } });

    TestBed.configureTestingModule({ providers: [provideMudLabels(source)] });
    const labels = TestBed.runInInjectionContext(() => injectMudLabels());

    expect(labels().banner.close).toBe('X');
    source.set({ banner: { close: 'Y' } });
    expect(labels().banner.close).toBe('Y');
  });

  it('runs a factory in an injection context', () => {
    const WORD = new InjectionToken<string>('WORD');

    TestBed.configureTestingModule({
      providers: [{ provide: WORD, useValue: 'Z' }, provideMudLabels(() => ({ banner: { close: inject(WORD) } }))],
    });
    const labels = TestBed.runInInjectionContext(() => injectMudLabels());

    expect(labels().banner.close).toBe('Z');
  });

  it('a nested provider merges onto its parent, and follows a parent signal', () => {
    const parent = signal({ banner: { close: 'P1' }, toast: { close: 'PT' } });

    TestBed.configureTestingModule({ providers: [provideMudLabels(parent)] });
    const fixture = TestBed.createComponent(Host);
    const labels = fixture.debugElement.children[0].componentInstance.labels;

    expect(labels().banner.close).toBe('C');
    expect(labels().toast.close).toBe('PT');
    parent.set({ banner: { close: 'P2' }, toast: { close: 'PT2' } });
    expect(labels().toast.close).toBe('PT2');
  });
});

describe('provideMudLabels undefined values', () => {
  it('an explicit undefined never overwrites a default', () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels({ chip: { remove: undefined }, banner: { close: undefined } })],
    });
    const labels = TestBed.runInInjectionContext(() => injectMudLabels())();

    expect(labels.chip.remove).toBe(MUD_LABELS_EN.chip.remove);
    expect(labels.banner.close).toBe('Close');
  });
});

describe('_mudText', () => {
  it('prefers a non-blank instance value', () => {
    expect(_mudText(undefined, 'L')).toBe('L');
    expect(_mudText(null, 'L')).toBe('L');
    expect(_mudText('', 'L')).toBe('L');
    expect(_mudText('   ', 'L')).toBe('L');
    expect(_mudText('I', 'L')).toBe('I');
  });

  it('returns a function instance as-is', () => {
    const own = (n: string): string => `own ${n}`;
    const fallback = (n: string): string => `fallback ${n}`;

    expect(_mudText(own, fallback)).toBe(own);
    expect(_mudText(undefined, fallback)).toBe(fallback);
  });
});

describe('MUD_LABELS_EN', () => {
  it('reproduces composed English output', () => {
    expect(MUD_LABELS_EN.pagination.pageAria(3, 10)).toBe('Page 3 of 10');
    expect(MUD_LABELS_EN.fileInput.added(['a.pdf'])).toBe('a.pdf added');
    expect(MUD_LABELS_EN.fileInput.added(['a', 'b'])).toBe('2 files added');
    expect(MUD_LABELS_EN.fileInput.formats(['PDF', 'PNG'])).toBe('Accepted formats: PDF, PNG');
  });
});
