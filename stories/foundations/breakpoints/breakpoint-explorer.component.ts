import { Component, computed, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudBreakpointValues } from 'ngx-mud-ui/breakpoints';
import type { MudBreakpointName } from 'ngx-mud-ui/breakpoints';

interface Band {
  key: MudBreakpointName;
  name: string;
  min: number;
  /** Last whole pixel before the next breakpoint; null for the open-ended top band. */
  max: number | null;
  devices: string;
}

const DEVICES: Record<MudBreakpointName, string> = {
  Xs: 'Small phones',
  Sm: 'Large phones',
  Md: 'Tablets',
  Lg: 'Laptops',
  Xl: 'Desktops',
  Xxl: 'Wide screens',
};

// Card columns of the example page per breakpoint; the sidebar stacks below md like mud-sidebar-layout.
const COLUMNS: Record<MudBreakpointName, number> = { Xs: 1, Sm: 2, Md: 2, Lg: 3, Xl: 3, Xxl: 4 };

const SCALE_MIN = MudBreakpointValues.Xs;
const SCALE_MAX = 1600;

const entries = Object.entries(MudBreakpointValues) as [MudBreakpointName, number][];

const BANDS: readonly Band[] = entries.map(([key, min], i) => ({
  key,
  name: key.toLowerCase(),
  min,
  max: i < entries.length - 1 ? entries[i + 1][1] - 1 : null,
  devices: DEVICES[key],
}));

/** Interactive ruler: drag a viewport width and see which breakpoint and mixins match. */
@Component({
  selector: 'mud-breakpoint-explorer',
  imports: [MudButton],
  template: `
    <div class="readout">
      <div class="readout__width" aria-live="polite">
        <span class="readout__num">{{ width() }}</span
        ><span class="readout__unit">px</span>
      </div>
      <div class="readout__bp">
        <span class="pill pill--active">{{ active().name }}</span>
        <span class="readout__devices">{{ active().devices }}</span>
      </div>
      <button type="button" mudButton color="secondary" size="small" (click)="fit()">
        Use this window's width
      </button>
    </div>

    <div class="ruler">
      <div class="bands">
        @for (band of bands; track band.key) {
          <button
            type="button"
            class="band"
            [class.band--active]="band.key === active().key"
            [class.band--passed]="band.min <= width()"
            [style.left.%]="pct(band.min)"
            [style.width.%]="pct(band.max === null ? scaleMax : band.max + 1) - pct(band.min)"
            [attr.aria-label]="band.name + ', from ' + band.min + 'px'"
            (click)="width.set(band.min)"
          >
            <span class="band__name">{{ band.name }}</span>
            <span class="band__min">{{ band.min }}</span>
          </button>
        }
      </div>
      <input
        class="slider"
        type="range"
        aria-label="Viewport width"
        [min]="scaleMin"
        [max]="scaleMax"
        [value]="width()"
        (input)="onSlide($event)"
      />
    </div>

    <div class="stage">
      <div class="preview" [style.width.%]="(width() / scaleMax) * 100">
        <div class="preview__chrome"><i></i><i></i><i></i></div>
        <div class="preview__header">
          <span class="preview__logo"></span>
          @if (wide()) {
            <span class="preview__nav"><i></i><i></i><i></i></span>
          } @else {
            <span class="preview__burger"><i></i><i></i><i></i></span>
          }
        </div>
        <div class="preview__body" [class.preview__body--stacked]="!wide()">
          <div class="preview__sidebar"><i></i><i></i><i></i></div>
          <div
            class="preview__cards"
            [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'"
          >
            @for (card of cards(); track $index) {
              <span class="preview__card"></span>
            }
          </div>
        </div>
      </div>
      <p class="stage__caption">
        Example page at <strong>{{ width() }}px</strong>:
        {{ wide() ? 'sidebar beside the content' : 'sidebar stacked above the content' }},
        {{ columns() }} card {{ columns() === 1 ? 'column' : 'columns' }}.
      </p>
    </div>

    <div class="matches-scroll">
      <table class="matches">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Range</th>
            <th scope="col">Typical devices</th>
            <th scope="col"><code>bp.up()</code></th>
            <th scope="col"><code>bp.down()</code></th>
          </tr>
        </thead>
        <tbody>
          @for (band of bands; track band.key) {
            <tr
              [class.matches__row--active]="band.key === active().key"
              (click)="width.set(band.min)"
            >
              <td>
                <span class="pill" [class.pill--active]="band.key === active().key">{{
                  band.name
                }}</span>
              </td>
              <td class="matches__range">
                {{ band.min }}{{ band.max === null ? 'px and up' : ' – ' + band.max + 'px' }}
              </td>
              <td>{{ band.devices }}</td>
              <td>
                <span class="hit" [class.hit--on]="width() >= band.min">{{
                  width() >= band.min ? '✓ matches' : '—'
                }}</span>
              </td>
              <td>
                <span class="hit" [class.hit--on]="width() < band.min">{{
                  width() < band.min ? '✓ matches' : '—'
                }}</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 24px;
      font-family: var(--mud-font-family-base);
      color: var(--mud-color-text-base-default);
    }

    .readout {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px 24px;
      margin-bottom: 24px;
    }
    .readout__width {
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }
    .readout__num {
      font-size: 48px;
      font-weight: var(--mud-font-weight-bold);
      color: var(--mud-color-text-brand-default);
    }
    .readout__unit {
      margin-left: 4px;
      font-size: 20px;
      color: var(--mud-color-text-base-secondary);
    }
    .readout__bp {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-right: auto;
    }
    .readout__devices {
      color: var(--mud-color-text-base-secondary);
    }

    .pill {
      display: inline-block;
      min-width: 32px;
      padding: 2px 10px;
      border-radius: var(--mud-border-radius-16);
      background: var(--mud-color-background-base-tertiary);
      font-family: ui-monospace, monospace;
      font-size: 13px;
      font-weight: var(--mud-font-weight-semibold);
      text-align: center;
    }
    .pill--active {
      background: var(--mud-color-background-brand-default);
      color: var(--mud-color-text-base-default-on-color);
    }
    .readout .pill {
      padding: 4px 14px;
      font-size: 18px;
    }

    .ruler {
      margin-bottom: 32px;
    }
    .bands {
      position: relative;
      height: 56px;
    }
    .band {
      position: absolute;
      top: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      padding: 0 8px;
      border: 0;
      border-left: 2px solid var(--mud-color-background-base-default);
      background: var(--mud-color-background-base-secondary);
      color: var(--mud-color-text-base-secondary);
      text-align: left;
      cursor: pointer;
      transition:
        background-color 150ms,
        color 150ms;
      overflow: hidden;
    }
    .band:first-child {
      border-left: 0;
      border-radius: var(--mud-border-radius-8) 0 0 var(--mud-border-radius-8);
    }
    .band:last-of-type {
      border-radius: 0 var(--mud-border-radius-8) var(--mud-border-radius-8) 0;
    }
    .band--passed {
      background: var(--mud-color-background-brand-secondary);
      color: var(--mud-color-text-brand-default);
    }
    .band--active {
      background: var(--mud-color-background-brand-default);
      color: var(--mud-color-text-base-default-on-color);
    }
    .band:focus-visible {
      outline: var(--mud-focus-ring-outer-width) solid var(--mud-focus-ring-outer-color);
      outline-offset: 2px;
      z-index: 1;
    }
    .band__name {
      font-family: ui-monospace, monospace;
      font-size: 15px;
      font-weight: var(--mud-font-weight-bold);
    }
    .band__min {
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .slider {
      display: block;
      width: 100%;
      margin: 12px 0 0;
      accent-color: var(--mud-color-background-brand-default);
      cursor: ew-resize;
    }

    .stage {
      margin-bottom: 32px;
      padding: 24px;
      border-radius: var(--mud-border-radius-12);
      background: var(--mud-color-background-base-secondary);
    }
    .preview {
      min-width: 96px;
      overflow: hidden;
      border: 1px solid var(--mud-color-border-base-default);
      border-radius: var(--mud-border-radius-8);
      background: var(--mud-color-background-base-default);
      box-shadow: var(--mud-drop-shadow-300);
      transition: width 120ms ease-out;
    }
    .preview i {
      display: block;
    }
    .preview__chrome {
      display: flex;
      gap: 4px;
      padding: 6px 8px;
      border-bottom: 1px solid var(--mud-color-border-base-subtle);
    }
    .preview__chrome i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--mud-color-border-base-strong);
    }
    .preview__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px;
    }
    .preview__logo {
      width: 32px;
      height: 10px;
      border-radius: 3px;
      background: var(--mud-color-background-brand-default);
    }
    .preview__nav {
      display: flex;
      gap: 6px;
    }
    .preview__nav i {
      width: 24px;
      height: 6px;
      border-radius: 3px;
      background: var(--mud-color-background-base-tertiary);
    }
    .preview__burger {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .preview__burger i {
      width: 12px;
      height: 2px;
      background: var(--mud-color-text-base-secondary);
    }
    .preview__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
      gap: 8px;
      padding: 0 8px 8px;
    }
    .preview__body--stacked {
      grid-template-columns: minmax(0, 1fr);
    }
    .preview__sidebar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 6px;
      border-radius: 4px;
      background: var(--mud-color-background-base-secondary);
    }
    .preview__body--stacked .preview__sidebar {
      flex-direction: row;
    }
    .preview__sidebar i {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: var(--mud-color-background-base-tertiary);
    }
    .preview__cards {
      display: grid;
      gap: 6px;
    }
    .preview__card {
      height: 36px;
      border-radius: 4px;
      background: var(--mud-color-background-brand-secondary);
    }
    .stage__caption {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }

    .matches-scroll {
      overflow-x: auto;
    }
    .matches {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .matches th {
      padding: 8px 12px;
      border-bottom: 2px solid var(--mud-color-border-base-default);
      font-weight: var(--mud-font-weight-semibold);
      text-align: left;
      color: var(--mud-color-text-base-secondary);
    }
    .matches td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--mud-color-border-base-subtle);
    }
    .matches tbody tr {
      cursor: pointer;
    }
    .matches tbody tr:hover {
      background: var(--mud-color-background-base-default-hover);
    }
    .matches__row--active,
    .matches__row--active:hover {
      background: var(--mud-color-background-base-secondary);
      box-shadow: inset 4px 0 0 var(--mud-color-background-brand-default);
      font-weight: var(--mud-font-weight-semibold);
    }
    .matches__range {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .hit {
      color: var(--mud-color-text-base-tertiary);
      white-space: nowrap;
    }
    .hit--on {
      font-weight: var(--mud-font-weight-semibold);
      color: var(--mud-color-text-positive-default);
    }

    @media (max-width: 640px) {
      :host {
        padding: 16px 0;
      }
      .readout__num {
        font-size: 36px;
      }
      .band {
        padding: 0 4px;
      }
      .band__min {
        display: none;
      }
      .stage {
        padding: 16px;
      }
      .matches th:nth-child(3),
      .matches td:nth-child(3) {
        display: none;
      }
    }
  `,
})
export class BreakpointExplorer {
  protected readonly bands = BANDS;
  protected readonly scaleMin = SCALE_MIN;
  protected readonly scaleMax = SCALE_MAX;

  readonly width = signal(1024);

  protected readonly active = computed(
    () => BANDS.filter((band) => band.min <= this.width()).at(-1) ?? BANDS[0],
  );
  protected readonly wide = computed(() => this.width() >= MudBreakpointValues.Md);
  protected readonly columns = computed(() => COLUMNS[this.active().key]);
  protected readonly cards = computed(() => Array.from({ length: this.columns() * 2 }));

  protected pct(px: number): number {
    return ((px - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  }

  protected onSlide(event: Event): void {
    this.width.set(Number((event.target as HTMLInputElement).value));
  }

  protected fit(): void {
    this.width.set(Math.min(SCALE_MAX, Math.max(SCALE_MIN, window.innerWidth)));
  }
}
