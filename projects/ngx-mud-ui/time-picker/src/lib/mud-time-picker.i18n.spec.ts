import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import { MudTimePicker } from './mud-time-picker.component';
import { MudTimeInput } from './mud-time-input.component';

@Component({ imports: [MudTimePicker], template: `<mud-time-picker />` })
class PickerHost {}

@Component({ imports: [MudTimeInput], template: `<mud-time-input />` })
class InputHost {}

describe('MudTimePicker i18n', () => {
  it('reads a label override from provideMudLabels', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels({ timePicker: { hours: 'Ore' } })],
    });

    const fixture = TestBed.createComponent(PickerHost);

    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[data-column="hours"]')!.getAttribute('aria-label')).toBe('Ore');
    expect(el.querySelector('[data-column="minutes"]')!.getAttribute('aria-label')).toBe('Minutes');
  });

  it('updates the time input labels live from a signal', async () => {
    const labels = signal<MudLabelsPartial>({});

    TestBed.configureTestingModule({ providers: [provideMudLabels(labels)] });

    const fixture = TestBed.createComponent(InputHost);

    await fixture.whenStable();

    const hint = () => (fixture.nativeElement as HTMLElement).querySelector('.time-field__format-hint')!;

    expect(hint().textContent!.trim()).toBe('Time format: HH:MM');

    labels.set({ timePicker: { formatHint: (p) => `Format: ${p}` } });
    await fixture.whenStable();

    expect(hint().textContent!.trim()).toBe('Format: HH:MM');
  });
});
