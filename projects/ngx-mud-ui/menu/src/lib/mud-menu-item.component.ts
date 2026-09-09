import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';

import { MUD_MENU_PANEL } from './mud-menu.types';
import type { MudMenuItemLeading } from './mud-menu.types';

/**
 * ```html
 * <mud-menu-item value="edit" leading="icon"><svg icon>…</svg> Edit</mud-menu-item>
 * ```
 */
@Component({
  selector: 'mud-menu-item',
  template: `
    @if (heading()) {
      <div class="menu__separator" role="separator" aria-hidden="true"></div>
    }
    @if (!heading()) {
      @switch (leading()) {
        @case ('icon') {
          <span class="menu__leading" aria-hidden="true"><ng-content select="[icon]" /></span>
        }
        @case ('checkbox') {
          <span class="menu__leading menu__control menu__control--checkbox" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="currentColor" focusable="false">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.494 4.236a.75.75 0 0 1 .07 1.058l-5.6 6.4a.75.75 0 0 1-1.094.036l-2.4-2.4a.75.75 0 1 1 1.06-1.06l1.833 1.833 5.073-5.797a.75.75 0 0 1 1.058-.07"
              />
            </svg>
          </span>
        }
        @case ('radio') {
          <span class="menu__leading menu__control menu__control--radio" aria-hidden="true"></span>
        }
      }
    }
    <span [class.menu__label]="!heading()" [class.menu__heading]="heading()"><ng-content /></span>
    @if (!heading() && _showCheck()) {
      <svg class="menu__check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15.527 5.398a.8.8 0 0 1 .075 1.129l-7 8a.8.8 0 0 1-1.168.039l-3-3a.8.8 0 0 1 1.132-1.132L7.96 12.83l6.437-7.357a.8.8 0 0 1 1.129-.075z"
        />
      </svg>
    }
    @if (!heading() && _hasSubmenu()) {
      <svg class="menu__chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.677 5.47a.75.75 0 0 1 1.06 0l3.293 3.293a1.75 1.75 0 0 1 0 2.474L8.737 14.53a.75.75 0 0 1-1.06-1.06l3.293-3.293a.25.25 0 0 0 0-.354L7.677 6.53a.75.75 0 0 1 0-1.06"
        />
      </svg>
    }
  `,
  host: {
    '[attr.role]': '_role()',
    '[attr.tabindex]': '_tabIndexAttr()',
    '[attr.aria-disabled]': '!heading() && disabled() ? "true" : null',
    '[attr.aria-checked]': '_ariaChecked()',
    '[attr.aria-selected]': '_ariaSelected()',
    '[class.menu__item]': '!heading()',
    '[class.menu__heading-row]': 'heading()',
    '[class.is-checked]': '!heading() && _selected()',
    '[class.is-disabled]': '!heading() && disabled()',
    '(click)': '_onClick()',
    '(keydown)': '_onKeydown($event)',
    '(mouseenter)': '_onMouseEnter()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudMenuItem {
  /** @description Value reported when the item is activated. */
  readonly value = input<string | undefined>(undefined);

  /** @description Leading element before the label: none, [icon] slot, or pure-CSS checkbox/radio. */
  readonly leading = input<MudMenuItemLeading>('none');

  /** @description Checked state for contextual checkbox/radio items. Selection menus derive it from the menu value. */
  readonly selected = input(false, { transform: booleanAttribute });

  /** @description Focusable but inert: aria-disabled, never skipped, never activatable. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Renders as a section divider plus optional tertiary label (segmented menus). */
  readonly heading = input(false, { transform: booleanAttribute });

  readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly _panel = inject(MUD_MENU_PANEL, { optional: true });

  /** @docs-private Roving tab stop, written by the parent panel. */
  readonly _tabStop = signal(false);

  /** @docs-private Set by a same-element MudMenuTrigger; renders the chevron. */
  readonly _hasSubmenu = signal(false);

  /** @docs-private Selection menus derive from the panel value; contextual uses the input. */
  readonly _selected = computed(() => {
    if (this._panel?.type() === 'selection') {
      return this.value() !== undefined && this._panel.value() === this.value();
    }

    return this.selected();
  });

  protected readonly _role = computed(() => {
    if (this.heading()) return 'presentation';

    if (this._panel?.type() === 'selection') return 'option';

    if (this.leading() === 'checkbox') return 'menuitemcheckbox';

    if (this.leading() === 'radio') return 'menuitemradio';

    return 'menuitem';
  });

  protected readonly _tabIndexAttr = computed(() => (this.heading() ? null : this._tabStop() ? 0 : -1));

  protected readonly _ariaChecked = computed(() => {
    const role = this._role();

    if (role !== 'menuitemcheckbox' && role !== 'menuitemradio') return null;

    return this._selected() ? 'true' : 'false';
  });

  protected readonly _ariaSelected = computed(() =>
    this._role() === 'option' ? (this._selected() ? 'true' : 'false') : null,
  );

  protected readonly _showCheck = computed(() => !this.heading() && this._panel?.type() === 'selection' && this._selected());

  constructor() {
    this._panel?._register(this);
    inject(DestroyRef).onDestroy(() => this._panel?._unregister(this));
  }

  /** Moves keyboard focus onto this item (parent-driven roving). */
  focus(): void {
    this._host.nativeElement.focus();
  }

  protected _onClick(): void {
    if (this.heading() || this.disabled()) return;

    this._panel?._activate(this);
  }

  protected _onKeydown(event: KeyboardEvent): void {
    if (this.heading() || this.disabled()) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._panel?._activate(this);
    }
  }

  protected _onMouseEnter(): void {
    if (this.heading()) return;

    this._panel?._itemEntered(this);
  }
}
