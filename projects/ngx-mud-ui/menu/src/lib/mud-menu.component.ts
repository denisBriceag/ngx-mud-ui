import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { MUD_MENU_PANEL } from './mud-menu.types';
import type {
  MudMenuPanel,
  MudMenuPositionX,
  MudMenuPositionY,
  MudMenuTriggerHandle,
  MudMenuType,
} from './mud-menu.types';
import type { MudMenuItem } from './mud-menu-item.component';
import { _MudMenuStyles, MudStyleLoader } from 'ngx-mud-ui/core';

let nextUniqueId = 0;

/**
 * ```html
 * <button mudButton [mudMenuTriggerFor]="actions">Actions</button>
 * <mud-menu #actions aria-label="Actions">
 *   <mud-menu-item value="edit">Edit</mud-menu-item>
 * </mud-menu>
 * ```
 */
@Component({
  selector: 'mud-menu',
  templateUrl: './mud-menu.component.html',
  imports: [NgTemplateOutlet],
  providers: [{ provide: MUD_MENU_PANEL, useExisting: MudMenu }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudMenu implements MudMenuPanel {
  /** @description Menu semantics: `contextual` (ARIA menu) or `selection` (single-select listbox). */
  readonly type = input<MudMenuType>('contextual');

  /** @description Selected value (selection menus). Two-way bindable. */
  readonly value = model<string | undefined>(undefined);

  /** @description Horizontal placement relative to the trigger. */
  readonly xPosition = input<MudMenuPositionX>('after');

  /** @description Vertical placement relative to the trigger. */
  readonly yPosition = input<MudMenuPositionY>('below');

  /** @description Request a close right after an item is activated. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });

  /** @description Standalone mode only: render the panel in place. Ignored while a trigger is attached. */
  readonly open = input(false, { transform: booleanAttribute });

  /** @description Accessible name for the panel. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra classes for the panel root, e.g. a component-specific modifier. */
  readonly panelClass = input<string | string[] | undefined>(undefined);

  /** @description Fired when any item is activated, with the item value ('' when it has none). */
  readonly selected = output<string>();

  /** @description Close request (Escape, Tab, closeOnSelect). With a trigger attached, listen on the trigger instead. */
  readonly closed = output<void>();

  /** @docs-private */
  readonly _panelId = `mud-menu-panel-${nextUniqueId++}`;

  /** @docs-private Trigger attaches this template to its overlay. */
  readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTpl');

  /** @docs-private */
  readonly _viewContainerRef = inject(ViewContainerRef);

  /** @docs-private The trigger currently presenting this panel, if any. */
  readonly _attachedTrigger = signal<MudMenuTriggerHandle | null>(null);

  private readonly _items = signal<readonly MudMenuItem[]>([]);
  private readonly _active = signal<MudMenuItem | null>(null);

  protected readonly _renderInline = computed(() => this.open() && !this._attachedTrigger());

  private readonly _ordered = computed(() => {
    this.open();
    this._attachedTrigger();

    return [...this._items()].sort((a, b) =>
      a._host.nativeElement.compareDocumentPosition(b._host.nativeElement) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  });

  private readonly _focusable = computed(() => this._ordered().filter((item) => !item.heading()));

  constructor() {
    inject(MudStyleLoader).load(_MudMenuStyles);

    afterRenderEffect(() => {
      const focusable = this._focusable();
      const active = this._active();
      const stop = active && focusable.includes(active) ? active : (focusable[0] ?? null);

      for (const item of this._focusable()) item._tabStop.set(item === stop);
    });
  }

  _register(item: MudMenuItem): void {
    this._items.update((items) => [...items, item]);
  }

  _unregister(item: MudMenuItem): void {
    this._items.update((items) => items.filter((candidate) => candidate !== item));

    if (this._active() === item) this._active.set(null);
  }

  _activate(item: MudMenuItem): void {
    if (item._hasSubmenu()) return;

    const value = item.value();

    if (this.type() === 'selection' && value !== undefined && this.value() !== value) {
      this.value.set(value);
    }

    this.selected.emit(value ?? '');

    if (this.closeOnSelect()) {
      this.closed.emit();
      this._attachedTrigger()?.closeAll(true);
    }
  }

  /** @docs-private Hover coordination; submenu sibling-closing arrives with the trigger. */
  _itemEntered(item: MudMenuItem): void {
    const child = this._attachedTrigger()?._childTrigger;

    if (child && child._hostItem !== item) child._scheduleClose();
  }

  _focusFirst(): void {
    this._focusItem(this._focusable()[0]);
  }

  _focusLast(): void {
    const focusable = this._focusable();

    this._focusItem(focusable[focusable.length - 1]);
  }

  private _focusItem(item: MudMenuItem | undefined): void {
    if (!item) return;

    this._active.set(item);
    item.focus();
  }

  private _focusRelative(offset: 1 | -1): void {
    const focusable = this._focusable();

    if (focusable.length === 0) return;

    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    const currentIndex = focusable.findIndex((item) => item._host.nativeElement === activeEl);
    const from = currentIndex >= 0 ? currentIndex : this._focusable().indexOf(this._active()!);
    const target = focusable[(from + offset + focusable.length) % focusable.length] ?? focusable[0];

    this._focusItem(target);
  }

  protected _onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._focusRelative(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._focusRelative(-1);
        break;
      case 'Home':
        event.preventDefault();
        this._focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this._focusLast();
        break;
      case 'ArrowLeft': {
        const trigger = this._attachedTrigger();

        if (trigger?.isSubmenu) {
          event.preventDefault();
          event.stopPropagation();
          trigger.close(true);
        }

        break;
      }
      case 'Escape': {
        event.preventDefault();
        event.stopPropagation();

        this.closed.emit();
        this._attachedTrigger()?.close(true);

        break;
      }
      case 'Tab': {
        this.closed.emit();
        this._attachedTrigger()?.closeAll(true);

        break;
      }
    }
  }
}
