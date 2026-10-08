import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { MUD_MEGA_MENU } from './mud-mega-menu.types';
import type { MudMegaMenuPanel, MudMegaMenuTriggerHandle } from './mud-mega-menu.types';

let nextUniqueId = 0;

/**
 * ```html
 * <button [mudMegaMenuTriggerFor]="services">Servicii</button>
 * <mud-mega-menu #services>
 *   <mud-mega-menu-column heading="Plăți"><a mudMegaMenuLink href="/mpay">MPay</a></mud-mega-menu-column>
 * </mud-mega-menu>
 * ```
 */
@Component({
  selector: 'mud-mega-menu',
  template: `
    <ng-template #panelTpl>
      <nav
        class="mega-menu"
        [class]="panelClass() ?? ''"
        tabindex="-1"
        [id]="_panelId"
        [attr.aria-label]="_label() || null"
        [attr.aria-labelledby]="_label() ? null : _triggerId() || null"
        (keydown)="_onKeydown($event)"
      >
        <div class="mega-menu__columns"><ng-content /></div>
      </nav>
    </ng-template>
  `,
  providers: [{ provide: MUD_MEGA_MENU, useExisting: MudMegaMenu }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudMegaMenu implements MudMegaMenuPanel {
  /** @description Accessible name for the panel; overrides the name taken from the button. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra classes for the panel root. */
  readonly panelClass = input<string | string[] | undefined>(undefined);

  /** @description Close request raised inside the panel (Escape, link activation, Tab past the last link). */
  readonly closed = output<void>();

  /** @docs-private */
  readonly _panelId = `mud-mega-menu-panel-${nextUniqueId++}`;

  /** @docs-private Trigger attaches this template to its overlay. */
  readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTpl');

  /** @docs-private */
  readonly _viewContainerRef = inject(ViewContainerRef);

  /** @docs-private The trigger currently presenting this panel, if any. */
  readonly _attachedTrigger = signal<MudMegaMenuTriggerHandle | null>(null);

  /** @docs-private Id of the presenting trigger; names the panel via aria-labelledby. */
  readonly _triggerId = signal('');

  protected readonly _label = computed(() => this.ariaLabel()?.trim() || '');

  private _linkCloseTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Menu torn down while open: close so the trigger doesn't keep a stale aria-expanded.
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this._linkCloseTimer);
      this._attachedTrigger()?.close(false);
    });
  }

  /** @docs-private Deferred so routerLink / native navigation see the click first. */
  _linkActivated(): void {
    clearTimeout(this._linkCloseTimer);
    this._linkCloseTimer = setTimeout(() => {
      if (this._attachedTrigger()) this._requestClose(false);
    }, 0);
  }

  /** @docs-private */
  _requestClose(restoreFocus: boolean): void {
    this.closed.emit();
    this._attachedTrigger()?.close(restoreFocus);
  }

  protected _onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this._requestClose(true);

      return;
    }

    if (event.key !== 'Tab') return;

    const links = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.mega-menu__link'));
    const index = links.indexOf(event.target as HTMLElement);

    if (!event.shiftKey && index >= 0 && index === links.length - 1) {
      this._requestClose(true);
    } else if (event.shiftKey && index === 0) {
      event.preventDefault();
      this._attachedTrigger()?._hostElement.focus();
    }
  }
}
