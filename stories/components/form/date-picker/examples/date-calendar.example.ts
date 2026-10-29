import { Component, signal } from '@angular/core';
import type { MudDateMonthChange, MudDateRange } from 'ngx-mud-ui/date-picker';
import { MudDatePicker } from 'ngx-mud-ui/date-picker';

@Component({
  selector: 'app-date-calendar',
  imports: [MudDatePicker],
  template: `
    <figure>
      <mud-date-picker aria-label="Data" [(value)]="date" (monthChange)="shown.set($event)" />
      <figcaption>
        single: {{ date() ?? 'null' }} · showing
        {{ shown() ? shown()!.month + 1 + '/' + shown()!.year : '—' }}
      </figcaption>
    </figure>
    <figure>
      <mud-date-picker
        mode="range"
        appearance="flat"
        headerStyle="dropdown"
        aria-label="Perioada"
        [(value)]="period"
      />
      <figcaption>range, flat, dropdown header</figcaption>
    </figure>
    <figure>
      <mud-date-picker
        mode="multi"
        startAt="2026-09-01"
        [showTodayShortcut]="false"
        aria-label="Zile"
        [(value)]="days"
      />
      <figcaption>multi: {{ days()?.length ?? 0 }} days</figcaption>
    </figure>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-start;
    }
    figure {
      margin: 0;
    }
    figcaption {
      margin-top: 8px;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class DateCalendarExample {
  readonly date = signal<string | null>(null);
  readonly shown = signal<MudDateMonthChange | null>(null);
  readonly period = signal<MudDateRange | null>(null);
  readonly days = signal<string[] | null>(['2026-09-08', '2026-09-15']);
}
