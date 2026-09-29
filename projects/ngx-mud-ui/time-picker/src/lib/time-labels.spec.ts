import { computed, isSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_TIME_LABELS, MUD_TIME_LABELS_DEFAULT, provideMudTimeLabels } from './time-labels';
import type { MudTimeLabels } from './time-labels';

function read(): MudTimeLabels {
  const source = TestBed.inject(MUD_TIME_LABELS);

  return isSignal(source) ? source() : source;
}

describe('MUD_TIME_LABELS', () => {
  it('defaults to English', () => {
    expect(read()).toBe(MUD_TIME_LABELS_DEFAULT);
    expect(read().picker).toBe('Time');
    expect(read().openPicker).toBe('Open time picker');
    expect(read().formatHint('HH:MM')).toBe('Time format: HH:MM');
  });

  it('merges a partial override over the defaults', () => {
    TestBed.configureTestingModule({ providers: [provideMudTimeLabels({ hours: 'Ore' })] });

    expect(read().hours).toBe('Ore');
    expect(read().minutes).toBe('Minutes');
  });

  it('accepts a signal and stays live', () => {
    const lang = signal<'en' | 'ro'>('en');
    const labels = computed(() => (lang() === 'ro' ? { clear: 'Șterge' } : {}));

    TestBed.configureTestingModule({ providers: [provideMudTimeLabels(labels)] });

    expect(read().clear).toBe('Clear');

    lang.set('ro');

    expect(read().clear).toBe('Șterge');
  });

  it('runs a factory in an injection context', () => {
    TestBed.configureTestingModule({
      providers: [provideMudTimeLabels(() => ({ picker: 'Selectează ora' }))],
    });

    expect(read().picker).toBe('Selectează ora');
  });
});
