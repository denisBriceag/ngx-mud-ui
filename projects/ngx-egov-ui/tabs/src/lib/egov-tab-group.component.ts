import {
  afterNextRender,
  booleanAttribute,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { EgovTab } from './egov-tab.component';
import type { EgovTabChangeEvent } from './egov-tab-change-event';

/**
 * ```html
 * <egov-tab-group [(selectedIndex)]="index" (selectedTabChange)="onChange($event)">
 *   <egov-tab label="Overview">…</egov-tab>
 *   <egov-tab label="Details" [disabled]="true">…</egov-tab>
 * </egov-tab-group>
 * ```
 */
@Component({
  selector: 'egov-tab-group',
  imports: [NgTemplateOutlet, CdkPortalOutlet],
  template: `
    <div class="tabs" [class.tabs--stretch]="stretchTabs()" [class.tabs--sm]="size() === 'sm'">
      <div
        class="tab-header"
        [class.tab-header--overflow-start]="canScrollStart()"
        [class.tab-header--overflow-end]="canScrollEnd()"
      >
        @if (canScrollStart()) {
          <button
            type="button"
            class="tab-scroll tab-scroll--prev"
            tabindex="-1"
            aria-hidden="true"
            (click)="scrollByStep(-1)"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        }

        <div class="tab-viewport" #viewport (scroll)="updateOverflow()">
          <div
            class="tab-buttons"
            #tabStrip
            role="tablist"
            aria-orientation="horizontal"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabelledby()"
          >
            @for (tab of tabs(); track tab; let i = $index) {
              <button
                #tabButton
                type="button"
                role="tab"
                class="tab-button"
                [class.active]="i === selectedIndex()"
                [id]="tab.tabId()"
                [disabled]="tab.disabled()"
                [attr.aria-selected]="i === selectedIndex()"
                [attr.aria-controls]="tab.tabId() + '-panel'"
                [attr.aria-label]="tab.ariaLabel()"
                [attr.aria-labelledby]="tab.ariaLabelledby()"
                [attr.tabindex]="i === selectedIndex() ? 0 : -1"
                (click)="selectTab(i)"
                (focus)="focusedIndex.set(i)"
                (keydown)="onKeydown($event)"
              >
                @if (tab.templateLabel(); as label) {
                  <ng-template [cdkPortalOutlet]="label" />
                } @else {
                  {{ tab.label() }}
                }
              </button>
            }
          </div>
        </div>

        @if (canScrollEnd()) {
          <button
            type="button"
            class="tab-scroll tab-scroll--next"
            tabindex="-1"
            aria-hidden="true"
            (click)="scrollByStep(1)"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        }
      </div>

      <div class="tab-panels">
        @for (tab of tabs(); track tab; let i = $index) {
          <div
            role="tabpanel"
            class="tab-panel"
            [class.active]="i === selectedIndex()"
            [id]="tab.tabId() + '-panel'"
            [attr.aria-labelledby]="tab.tabId()"
            [attr.tabindex]="i === selectedIndex() ? contentTabIndex() : null"
            [hidden]="i !== selectedIndex()"
          >
            <ng-container [ngTemplateOutlet]="tab.content()" />
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './egov-tab-group.component.scss',
})
export class EgovTabGroup {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly tabs = contentChildren(EgovTab);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly contentTabIndex = input<number | null>(null);
  readonly stretchTabs = input(false, { transform: booleanAttribute });
  readonly size = input<'md' | 'sm'>('md');
  readonly selectedIndex = model(0);

  readonly selectedTabChange = output<EgovTabChangeEvent>();

  protected readonly focusedIndex = signal(0);
  protected readonly canScrollStart = signal(false);
  protected readonly canScrollEnd = signal(false);

  private readonly _buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly _viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly _strip = viewChild<ElementRef<HTMLElement>>('tabStrip');

  private _lastEmitted = -1;
  private _initialized = false;

  constructor() {
    afterNextRender(() => {
      const tabs = this.tabs();
      const current = this.selectedIndex();

      if (!tabs[current] || tabs[current].disabled()) {
        const firstEnabled = tabs.findIndex((tab) => !tab.disabled());

        if (firstEnabled >= 0) {
          this.selectedIndex.set(firstEnabled);
        }
      }
    });

    afterNextRender(() => {
      this.updateOverflow();

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() => this.updateOverflow());
      const viewport = this._viewport()?.nativeElement;
      const strip = this._strip()?.nativeElement;

      if (viewport) {
        observer.observe(viewport);
      }

      if (strip) {
        observer.observe(strip);
      }

      this._destroyRef.onDestroy(() => observer.disconnect());
    });

    effect(() => {
      const tabs = this.tabs();
      const index = this.selectedIndex();

      tabs.forEach((tab, i) => {
        tab.position.set(i);
        tab.isActive.set(i === index);
      });

      const tab = tabs[index];

      if (tab) {
        if (this._initialized && index !== this._lastEmitted) {
          this.selectedTabChange.emit({ index, tab });
        }

        this._lastEmitted = index;
        this._initialized = true;
      }
    });
  }

  selectTab(index: number): void {
    const tabs = this.tabs();

    if (index < 0 || index >= tabs.length || tabs[index].disabled()) {
      return;
    }

    this.selectedIndex.set(index);
    this.focusedIndex.set(index);
  }

  focusTab(index: number): void {
    if (!this._isBrowser) return;

    if (index >= 0 && index < this.tabs().length) {
      this.focusedIndex.set(index);

      const button = this._buttons()[index]?.nativeElement;

      button?.focus();
      button?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
  }

  protected updateOverflow(): void {
    const viewport = this._viewport()?.nativeElement;

    if (!viewport) {
      this.canScrollStart.set(false);
      this.canScrollEnd.set(false);

      return;
    }

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const left = viewport.scrollLeft;

    this.canScrollStart.set(left > 1);
    this.canScrollEnd.set(maxScroll > 1 && left < maxScroll - 1);
  }

  protected scrollByStep(direction: 1 | -1): void {
    const viewport = this._viewport()?.nativeElement;

    viewport?.scrollBy({ left: direction * viewport.clientWidth * 0.75, behavior: 'smooth' });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs().length;

    if (count === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        this.focusTab(this._nextEnabled(this.focusedIndex(), 1));
        break;
      case 'ArrowLeft':
        this.focusTab(this._nextEnabled(this.focusedIndex(), -1));
        break;
      case 'Home':
        this.focusTab(this._nextEnabled(-1, 1));
        break;
      case 'End':
        this.focusTab(this._nextEnabled(count, -1));
        break;
      case 'Enter':
      case ' ':
        this.selectTab(this.focusedIndex());
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  private _nextEnabled(from: number, direction: 1 | -1): number {
    const tabs = this.tabs();
    const count = tabs.length;
    let index = from;

    for (let step = 0; step < count; step++) {
      index = (index + direction + count) % count;

      if (!tabs[index].disabled()) {
        return index;
      }
    }

    return Math.max(0, Math.min(from, count - 1));
  }
}
