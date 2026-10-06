import { isSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_STEPPER_LABELS, provideMudStepperLabels } from './stepper-labels';
import type { MudStepperLabels } from './stepper-labels';

/** The token may hold a plain object or a signal; tests read through both. */
function currentLabels(): MudStepperLabels {
  const value = TestBed.inject(MUD_STEPPER_LABELS);

  return isSignal(value) ? value() : value;
}

describe('stepper-labels', () => {
  it('ships English defaults with no provider', () => {
    expect(currentLabels()).toEqual({ completed: 'completed', blocked: 'has errors' });
  });

  it('merges a partial override over the defaults', () => {
    TestBed.configureTestingModule({ providers: [provideMudStepperLabels({ completed: 'finalizat' })] });

    expect(currentLabels()).toEqual({ completed: 'finalizat', blocked: 'has errors' });
  });

  it('tracks a signal override live, still merged over the defaults', () => {
    const override = signal<Partial<MudStepperLabels>>({ blocked: 'conține erori' });

    TestBed.configureTestingModule({ providers: [provideMudStepperLabels(override)] });

    expect(currentLabels().blocked).toBe('conține erori');
    override.set({});
    expect(currentLabels().blocked).toBe('has errors');
  });

  it('runs a factory in an injection context and accepts a signal from it', () => {
    const override = signal<Partial<MudStepperLabels>>({ completed: 'gata' });

    TestBed.configureTestingModule({ providers: [provideMudStepperLabels(() => override)] });

    expect(currentLabels().completed).toBe('gata');
  });
});
