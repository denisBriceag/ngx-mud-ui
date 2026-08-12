import {
  afterNextRender,
  booleanAttribute,
  Component,
  contentChildren,
  effect,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
        class="tab-buttons"
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
  readonly tabs = contentChildren(EgovTab);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly contentTabIndex = input<number | null>(null);
  readonly stretchTabs = input(false, { transform: booleanAttribute });
  readonly size = input<'md' | 'sm'>('md');
  readonly selectedIndex = model(0);

  readonly selectedTabChange = output<EgovTabChangeEvent>();

  protected readonly focusedIndex = signal(0);

  private readonly _buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
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
    if (index >= 0 && index < this.tabs().length) {
      this.focusedIndex.set(index);
      this._buttons()[index]?.nativeElement.focus();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs().length;

    if (count === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        this.focusTab(this.nextEnabled(this.focusedIndex(), 1));
        break;
      case 'ArrowLeft':
        this.focusTab(this.nextEnabled(this.focusedIndex(), -1));
        break;
      case 'Home':
        this.focusTab(this.nextEnabled(-1, 1));
        break;
      case 'End':
        this.focusTab(this.nextEnabled(count, -1));
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

  private nextEnabled(from: number, direction: 1 | -1): number {
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
