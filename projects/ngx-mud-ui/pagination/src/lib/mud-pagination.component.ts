import type { OnDestroy, OnInit } from '@angular/core';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';
import { ReplaySubject } from 'rxjs';
import type { Observable } from 'rxjs';
import { MUD_PAGINATION_LABELS } from './mud-pagination-labels';
import type { MudPageEvent, MudPaginationSize } from './mud-pagination.types';
import { computeSlots } from './pagination-range';
import type { MudPaginationSlot } from './pagination-range';
import { _injectMudLabels } from 'ngx-mud-ui/core';

type OverflowSlot = Extract<MudPaginationSlot, { kind: 'overflow' }>;

const FALLBACK_METRICS: Record<MudPaginationSize, { item: number; gap: number; innerGap: number }> = {
  medium: { item: 40, gap: 24, innerGap: 16 },
  small: { item: 32, gap: 4, innerGap: 8 },
};

/**
 * ```html
 * <mud-pagination [length]="200" [pageSize]="10" [(pageIndex)]="index" (page)="load($event)" />
 * ```
 */
@Component({
  selector: 'mud-pagination',
  styleUrl: './mud-pagination.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MudMenu, MudMenuItem, MudMenuTrigger, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mud-pagination',
    '[class.mud-pagination--small]': "size() === 'small'",
    '[attr.aria-label]': 'null',
  },
  template: `
    <ng-template #chevronLeft>
      <svg class="mud-pagination__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.323 5.47a.75.75 0 0 1 0 1.06L9.03 9.823a.25.25 0 0 0 0 .354l3.293 3.293a.75.75 0 1 1-1.06 1.06L7.97 11.237a1.75 1.75 0 0 1 0-2.474l3.293-3.293a.75.75 0 0 1 1.06 0"
        />
      </svg>
    </ng-template>
    <ng-template #chevronRight>
      <svg class="mud-pagination__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.677 5.47a.75.75 0 0 1 1.06 0l3.293 3.293a1.75 1.75 0 0 1 0 2.474L8.737 14.53a.75.75 0 0 1-1.06-1.06l3.293-3.293a.25.25 0 0 0 0-.354L7.677 6.53a.75.75 0 0 1 0-1.06"
        />
      </svg>
    </ng-template>
    @if (_pageCount() > 1) {
      <span class="mud-pagination__probe" aria-hidden="true">
        <span class="mud-pagination__nav-button" data-probe="previous">
          <ng-container [ngTemplateOutlet]="chevronLeft" />
          <span class="mud-pagination__nav-label">{{ _labels().previous }}</span>
        </span>
        <span class="mud-pagination__nav-button" data-probe="next">
          <span class="mud-pagination__nav-label">{{ _labels().next }}</span>
          <ng-container [ngTemplateOutlet]="chevronRight" />
        </span>
      </span>
      <nav class="mud-pagination__nav" [attr.aria-label]="ariaLabel() || _labels().navigation">
        @if (hasPreviousPage()) {
          <button
            type="button"
            class="mud-pagination__nav-button mud-pagination__nav-button--previous"
            [disabled]="disabled()"
            [attr.aria-label]="_labels().previousAria(_current())"
            (click)="_select(_current() - 1)"
          >
            <ng-container [ngTemplateOutlet]="chevronLeft" />
            <span class="mud-pagination__nav-label">{{ _labels().previous }}</span>
          </button>
        }
        <ul class="mud-pagination__pages" role="list">
          @for (slot of _slots(); track $index) {
            <li class="mud-pagination__item">
              @if (slot.kind === 'page') {
                <button
                  type="button"
                  class="mud-pagination__page"
                  [class.mud-pagination__page--current]="slot.page === _current() + 1"
                  [disabled]="disabled()"
                  [attr.aria-current]="slot.page === _current() + 1 ? 'page' : null"
                  [attr.aria-label]="_labels().pageAria(slot.page, _pageCount())"
                  (click)="_select(slot.page - 1)"
                >
                  {{ slot.page }}
                </button>
              } @else {
                <button
                  type="button"
                  class="mud-pagination__overflow"
                  [disabled]="disabled()"
                  [mudMenuTriggerFor]="menu"
                  [attr.aria-label]="_overflowLabel(slot)"
                >
                  <span aria-hidden="true">&hellip;</span>
                </button>
                <mud-menu #menu panelClass="mud-pagination__menu" [aria-label]="_overflowLabel(slot)" (selected)="_selectFromMenu($event)">
                  @for (page of slot.pages; track page) {
                    <mud-menu-item [value]="'' + page" [attr.aria-label]="_labels().pageAria(page, _pageCount())">{{ page }}</mud-menu-item>
                  }
                </mud-menu>
              }
            </li>
          }
        </ul>
        @if (hasNextPage()) {
          <button
            type="button"
            class="mud-pagination__nav-button mud-pagination__nav-button--next"
            [disabled]="disabled()"
            [attr.aria-label]="_labels().nextAria(_current() + 2)"
            (click)="_select(_current() + 1)"
          >
            <span class="mud-pagination__nav-label">{{ _labels().next }}</span>
            <ng-container [ngTemplateOutlet]="chevronRight" />
          </button>
        }
      </nav>
    }
  `,
})
export class MudPagination implements OnInit, OnDestroy {
  /** @description Total number of items. `MudTableDataSource` writes it. */
  readonly length = model(0);

  /** @description Zero-based index of the current page. Two-way bindable. */
  readonly pageIndex = model(0);

  /** @description Items per page; drives the page count. */
  readonly pageSize = input(10, { transform: numberAttribute });

  /** @description Disables every control. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Size rung: 32px (`small`, no Prev/Next text) or 40px (`medium`). */
  readonly size = input<MudPaginationSize>('medium');

  /** @description Accessible name for the navigation landmark. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Fired when the user, a method call or the data source changes the page. */
  readonly page = output<MudPageEvent>();

  private readonly _initialized = new ReplaySubject<void>(1);

  /** Emits once the paginator is ready; `MudTableDataSource` waits for it. */
  readonly initialized: Observable<void> = this._initialized.asObservable();

  private readonly _host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly _labels = _injectMudLabels(MUD_PAGINATION_LABELS);

  private readonly _length = computed(() => {
    const value = Math.floor(this.length());

    return Number.isFinite(value) ? Math.max(0, value) : 0;
  });

  /** @docs-private Page size normalised to a whole number ≥ 1. */
  readonly _pageSize = computed(() => {
    const value = Math.floor(this.pageSize());

    return Number.isFinite(value) && value >= 1 ? value : 1;
  });

  protected readonly _pageCount = computed(() => Math.ceil(this._length() / this._pageSize()));

  /** @docs-private pageIndex clamped to the existing pages. */
  readonly _current = computed(() => {
    const value = Math.floor(this.pageIndex());
    const last = Math.max(this._pageCount() - 1, 0);

    return Number.isFinite(value) ? Math.min(Math.max(value, 0), last) : 0;
  });

  /** @docs-private True when only 5 slots fit (Task 6 drives it). */
  readonly _compact = signal(false);

  protected readonly _slots = computed(() => computeSlots(this._current() + 1, this._pageCount(), this._compact() ? 0 : 1));

  /** @docs-private pageIndex / pageSize changes from any source, for the data source. */
  readonly _stateChanges = toObservable(
    computed(() => ({ pageIndex: this.pageIndex(), pageSize: this._pageSize() }), {
      equal: (a, b) => a.pageIndex === b.pageIndex && a.pageSize === b.pageSize,
    }),
  );

  constructor() {
    if (!this._isBrowser) return;

    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver(() => this._measure());

      observer.observe(this._host);
      this._destroyRef.onDestroy(() => observer.disconnect());
    });

    afterRenderEffect(() => {
      this._labels();
      this.size();
      this._pageCount();
      this._measure();
    });
  }

  ngOnInit(): void {
    this._initialized.next();
  }

  ngOnDestroy(): void {
    this._initialized.complete();
  }

  nextPage(): void {
    if (this.hasNextPage()) this._goTo(this._current() + 1);
  }

  previousPage(): void {
    if (this.hasPreviousPage()) this._goTo(this._current() - 1);
  }

  firstPage(): void {
    this._goTo(0);
  }

  lastPage(): void {
    this._goTo(this._pageCount() - 1);
  }

  hasNextPage(): boolean {
    return this._current() < this._pageCount() - 1;
  }

  hasPreviousPage(): boolean {
    return this._current() > 0;
  }

  getNumberOfPages(): number {
    return this._pageCount();
  }

  /** @docs-private Emits `page` for the current state; the data source uses it after clamping. */
  _emitPageEvent(previousPageIndex: number): void {
    this.page.emit({
      pageIndex: this._current(),
      previousPageIndex,
      pageSize: this._pageSize(),
      length: this._length(),
    });
  }

  protected _select(index: number): void {
    if (this.disabled()) return;

    const before = this._current();

    this._goTo(index);

    if (this._current() === before) return;

    afterNextRender(
      () => {
        const active = document.activeElement;
        const movedPage = active?.classList.contains('mud-pagination__page') && !active.classList.contains('mud-pagination__page--current');

        if (active && active !== document.body && active.isConnected && !movedPage) return;

        this._host.querySelector<HTMLElement>('.mud-pagination__page--current')?.focus();
      },
      { injector: this._injector },
    );
  }

  protected _selectFromMenu(value: string): void {
    this._select(Number(value) - 1);
  }

  protected _overflowLabel(slot: OverflowSlot): string {
    return this._labels().overflowAria(slot.pages[0], slot.pages[slot.pages.length - 1]);
  }

  private _goTo(index: number): void {
    const previous = this._current();
    const next = Math.min(Math.max(index, 0), Math.max(this._pageCount() - 1, 0));

    if (next === previous) return;

    this.pageIndex.set(next);
    this._emitPageEvent(previous);
  }

  private _measure(): void {
    const width = this._host.clientWidth;

    if (width === 0) return;

    const fallback = FALLBACK_METRICS[this.size()];
    const style = getComputedStyle(this._host);
    const px = (name: string, value: number) => {
      const parsed = parseFloat(style.getPropertyValue(name));

      return Number.isFinite(parsed) ? parsed : value;
    };
    const prevProbe = this._host.querySelector<HTMLElement>('.mud-pagination__probe [data-probe="previous"]');
    const nextProbe = this._host.querySelector<HTMLElement>('.mud-pagination__probe [data-probe="next"]');
    const nav = (prevProbe?.offsetWidth ?? 0) + (nextProbe?.offsetWidth ?? 0);

    const required = nav + 7 * px('--_item-size', fallback.item) + 6 * px('--_inner-gap', fallback.innerGap) + 2 * px('--_gap', fallback.gap);

    this._compact.set(width < required);
  }
}
