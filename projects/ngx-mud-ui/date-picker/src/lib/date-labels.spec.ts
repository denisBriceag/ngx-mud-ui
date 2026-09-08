import { isSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_DATE_LABELS, provideMudDateLabels } from './date-labels';
import type { MudDateLabels } from './date-labels';

/** The token may hold a plain object or a signal; tests read through both. */
function currentLabels(): MudDateLabels {
  const value = TestBed.inject(MUD_DATE_LABELS);

  return isSignal(value) ? value() : value;
}

describe('date-labels', () => {
  it('ships English defaults with no provider', () => {
    const labels = currentLabels();

    expect(labels.today).toBe('Today');
    expect(labels.calendar).toBe('Calendar');
  });

  it('merges a partial override over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideMudDateLabels({ today: 'Astăzi', calendar: 'Calendar' })],
    });

    const labels = currentLabels();

    expect(labels.today).toBe('Astăzi');
    // Untouched keys keep their defaults, so a partial override is safe.
    expect(labels.nextMonth).toBe('Next month');
  });

  it('exposes message builders for the live region', () => {
    const labels = currentLabels();

    expect(labels.formatHint('DD/MM/YYYY')).toBe('Date format: DD/MM/YYYY');
    expect(labels.rangeSelected('15 August', '20 August')).toBe('15 August to 20 August selected');
  });

  it('tracks a signal override live, still merged over the defaults', () => {
    const lang = signal<Partial<MudDateLabels>>({ today: 'Astăzi' });

    TestBed.configureTestingModule({ providers: [provideMudDateLabels(lang)] });

    expect(currentLabels().today).toBe('Astăzi');
    expect(currentLabels().nextMonth).toBe('Next month');

    lang.set({ today: 'Heute' });
    expect(currentLabels().today).toBe('Heute');
  });

  it('accepts a factory, so the override can inject app services', () => {
    // Returning a signal from the factory keeps it live; a plain partial works too.
    TestBed.configureTestingModule({
      providers: [provideMudDateLabels(() => ({ today: 'Astăzi' }))],
    });

    expect(currentLabels().today).toBe('Astăzi');
    expect(currentLabels().clear).toBe('Clear');
  });
});
