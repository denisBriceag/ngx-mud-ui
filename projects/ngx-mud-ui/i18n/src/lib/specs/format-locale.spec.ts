import { Component, inject, InjectionToken, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectMudFormatLocale, provideMudFormatLocale, _safeLocale } from '../format-locale';

@Component({ selector: 'mud-locale-probe', template: '' })
class Probe {
  readonly locale = injectMudFormatLocale();
}

@Component({ selector: 'mud-locale-host', template: '<mud-locale-probe />', imports: [Probe], providers: [provideMudFormatLocale('de-DE')] })
class Host {}

describe('provideMudFormatLocale', () => {
  const read = () => TestBed.runInInjectionContext(() => injectMudFormatLocale());

  it('defaults to LOCALE_ID', () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'ro-MD' }] });

    expect(read()()).toBe('ro-MD');
  });

  it('accepts a static tag', () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('fr-FR')] });

    expect(read()()).toBe('fr-FR');
  });

  it('accepts a signal and updates live', () => {
    const source = signal('fr-FR');

    TestBed.configureTestingModule({ providers: [provideMudFormatLocale(source)] });

    expect(read()()).toBe('fr-FR');
    source.set('ru-MD');
    expect(read()()).toBe('ru-MD');
  });

  it('runs a factory in an injection context', () => {
    const TAG = new InjectionToken<string>('TAG');

    TestBed.configureTestingModule({
      providers: [{ provide: TAG, useValue: 'it-IT' }, provideMudFormatLocale(() => inject(TAG))],
    });

    expect(read()()).toBe('it-IT');
  });

  it('a nested provider overrides its parent', () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('fr-FR')] });
    const fixture = TestBed.createComponent(Host);

    expect(fixture.debugElement.children[0].componentInstance.locale()).toBe('de-DE');
  });

  it('an invalid tag falls back to LOCALE_ID', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'ro-MD' }, provideMudFormatLocale('xx-INVALID')],
    });

    expect(read()()).toBe('ro-MD');
  });
});

describe('nested provideMudFormatLocale fallback', () => {
  it('an invalid nested tag falls back to the parent locale, not LOCALE_ID', () => {
    @Component({ selector: 'mud-bad-host', template: '<mud-locale-probe />', imports: [Probe], providers: [provideMudFormatLocale('xx-INVALID')] })
    class BadHost {}

    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'en-US' }, provideMudFormatLocale('ro-MD')] });
    const fixture = TestBed.createComponent(BadHost);

    expect(fixture.debugElement.children[0].componentInstance.locale()).toBe('ro-MD');
  });
  it('an invalid nested tag follows the parent signal live', () => {
    const parentLocale = signal('ro-MD');

    @Component({ selector: 'mud-bad-live-host', template: '<mud-locale-probe />', imports: [Probe], providers: [provideMudFormatLocale('xx-INVALID')] })
    class BadHost {}

    TestBed.configureTestingModule({ providers: [provideMudFormatLocale(parentLocale)] });
    const fixture = TestBed.createComponent(BadHost);
    const probe = fixture.debugElement.children[0].componentInstance as Probe;

    expect(probe.locale()).toBe('ro-MD');
    parentLocale.set('ru-RU');
    expect(probe.locale()).toBe('ru-RU');
  });
});

describe('_safeLocale', () => {
  it('falls back through the fallback to en-US', () => {
    expect(_safeLocale('nonsense', 'bad-too')).toBe('en-US');
    expect(_safeLocale('nonsense', 'ro-MD')).toBe('ro-MD');
    expect(_safeLocale('  ')).toBe('en-US');
    expect(_safeLocale(null)).toBe('en-US');
    expect(_safeLocale('ro-MD')).toBe('ro-MD');
  });
});
