import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MudToastStack } from '../mud-toast-stack.component';
import { MudToastRef } from '../mud-toast-ref';
import { resolveToastConfig } from '../mud-toast-config';
import { nextToastId } from '../mud-toast-entry';
import type { MudToastEntry } from '../mud-toast-entry';
import type { MudToastVariant, MudToastVerticalPosition } from '../mud-toast-config';

function entryOf(message: string, variant: MudToastVariant): MudToastEntry {
  return {
    id: nextToastId(),
    config: resolveToastConfig({ variant, duration: 0 }),
    ref: new MudToastRef(),
    data: { message },
    leaving: signal(false),
  };
}

@Component({
  imports: [MudToastStack],
  template: `<mud-toast-stack [entries]="entries()" [verticalPosition]="vertical()" />`,
})
class Host {
  readonly entries = signal<readonly MudToastEntry[]>([]);
  readonly vertical = signal<MudToastVerticalPosition>('top');
}

function bodies(fixture: { nativeElement: HTMLElement }): string[] {
  return [...fixture.nativeElement.querySelectorAll('.mud-toast__body')].map((n) => n.textContent!.trim());
}

describe('MudToastStack ordering', () => {
  it('puts the newest toast first when anchored to the top', () => {
    const fixture = TestBed.createComponent(Host);

    // Insertion order is oldest → newest.
    fixture.componentInstance.entries.set([
      entryOf('first', 'info'),
      entryOf('second', 'info'),
      entryOf('third', 'info'),
    ]);
    fixture.detectChanges();

    expect(bodies(fixture)).toEqual(['third', 'second', 'first']);
  });

  it('puts the newest toast last when anchored to the bottom', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.vertical.set('bottom');
    fixture.componentInstance.entries.set([
      entryOf('first', 'info'),
      entryOf('second', 'info'),
      entryOf('third', 'info'),
    ]);
    fixture.detectChanges();

    expect(bodies(fixture)).toEqual(['first', 'second', 'third']);
  });
});

describe('MudToastStack gap rule', () => {
  it('gives the first visual item no gap, same-variant neighbours the tight gap, and a variant change the wide gap', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.vertical.set('bottom'); // visual order == insertion order
    fixture.componentInstance.entries.set([
      entryOf('a', 'success'),
      entryOf('b', 'success'),
      entryOf('c', 'error'),
      entryOf('d', 'error'),
      entryOf('e', 'info'),
    ]);
    fixture.detectChanges();

    const items = [...fixture.nativeElement.querySelectorAll('mud-toast-item')] as HTMLElement[];
    const gapOf = (el: HTMLElement) =>
      el.classList.contains('mud-toast-stack__item--gap-mixed')
        ? 'mixed'
        : el.classList.contains('mud-toast-stack__item--gap-same')
          ? 'same'
          : 'none';

    expect(items.map(gapOf)).toEqual(['none', 'same', 'mixed', 'same', 'mixed']);
  });

  it('computes the gap against the visually-preceding toast, not insertion order', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.vertical.set('top'); // visual order is REVERSED
    fixture.componentInstance.entries.set([entryOf('a', 'info'), entryOf('b', 'error'), entryOf('c', 'error')]);
    fixture.detectChanges();

    const items = [...fixture.nativeElement.querySelectorAll('mud-toast-item')] as HTMLElement[];

    // Visual order is c(error), b(error), a(info): none, same, mixed.
    expect(items[0].classList.contains('mud-toast-stack__item--gap-same')).toBe(false);
    expect(items[1].classList.contains('mud-toast-stack__item--gap-same')).toBe(true);
    expect(items[2].classList.contains('mud-toast-stack__item--gap-mixed')).toBe(true);
  });
});
