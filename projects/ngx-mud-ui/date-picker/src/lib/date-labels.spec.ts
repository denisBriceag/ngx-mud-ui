import { TestBed } from '@angular/core/testing';
import { MUD_DATE_LABELS, provideMudDateLabels } from './date-labels';

describe('date-labels', () => {
  it('ships English defaults with no provider', () => {
    const labels = TestBed.inject(MUD_DATE_LABELS);

    expect(labels.today).toBe('Today');
    expect(labels.calendar).toBe('Calendar');
  });

  it('merges a partial override over the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideMudDateLabels({ today: 'Astăzi', calendar: 'Calendar' })],
    });

    const labels = TestBed.inject(MUD_DATE_LABELS);

    expect(labels.today).toBe('Astăzi');
    // Untouched keys keep their defaults, so a partial override is safe.
    expect(labels.nextMonth).toBe('Next month');
  });

  it('exposes message builders for the live region', () => {
    const labels = TestBed.inject(MUD_DATE_LABELS);

    expect(labels.formatHint('DD/MM/YYYY')).toBe('Date format: DD/MM/YYYY');
    expect(labels.rangeSelected('15 August', '20 August')).toBe('15 August to 20 August selected');
  });
});
