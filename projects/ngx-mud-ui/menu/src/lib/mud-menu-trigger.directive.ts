import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import type { ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { Subscription } from 'rxjs';

import type { MudMenu } from './mud-menu.component';
import { MudMenuItem } from './mud-menu-item.component';
import { MUD_MENU_PANEL } from './mud-menu.types';
import type { MudMenuPositionX, MudMenuPositionY, MudMenuTriggerHandle } from './mud-menu.types';

const SUBMENU_HOVER_DELAY_MS = 120;

function rootPositions(x: MudMenuPositionX, y: MudMenuPositionY): ConnectedPosition[] {
  const alignX = x === 'before' ? 'end' : 'start';
  const flipX = x === 'before' ? 'start' : 'end';
  const originY = y === 'above' ? 'top' : 'bottom';
  const overlayY = y === 'above' ? 'bottom' : 'top';
  const flipOriginY = y === 'above' ? 'bottom' : 'top';
  const flipOverlayY = y === 'above' ? 'top' : 'bottom';
  const offsetY = y === 'above' ? -4 : 4;

  return [
    { originX: alignX, originY, overlayX: alignX, overlayY, offsetY },
    { originX: alignX, originY: flipOriginY, overlayX: alignX, overlayY: flipOverlayY, offsetY: -offsetY },
    { originX: flipX, originY, overlayX: flipX, overlayY, offsetY },
    { originX: flipX, originY: flipOriginY, overlayX: flipX, overlayY: flipOverlayY, offsetY: -offsetY },
  ];
}

function submenuPositions(x: MudMenuPositionX): ConnectedPosition[] {
  const [originX, overlayX] = x === 'before' ? (['start', 'end'] as const) : (['end', 'start'] as const);
  const [flipOriginX, flipOverlayX] = x === 'before' ? (['end', 'start'] as const) : (['start', 'end'] as const);

  return [
    { originX, originY: 'top', overlayX, overlayY: 'top', offsetY: -8 },
    { originX: flipOriginX, originY: 'top', overlayX: flipOverlayX, overlayY: 'top', offsetY: -8 },
    { originX, originY: 'bottom', overlayX, overlayY: 'bottom', offsetY: 8 },
    { originX: flipOriginX, originY: 'bottom', overlayX: flipOverlayX, overlayY: 'bottom', offsetY: 8 },
  ];
}

/**
 * ```html
 * <button mudButton [mudMenuTriggerFor]="menu">Open</button>
 * ```
 */
@Directive({
  selector: '[mudMenuTriggerFor]',
  host: {
    '[attr.aria-haspopup]': "menu().type() === 'selection' ? 'listbox' : 'menu'",
    '[attr.aria-expanded]': '_isOpen()',
    '[attr.aria-controls]': '_isOpen() ? menu()._panelId : null',
    '(click)': '_onClick($event)',
    '(keydown)': '_onKeydown($event)',
    '(mouseenter)': '_onMouseEnter()',
    '(mouseleave)': '_onMouseLeave()',
  },
})
export class MudMenuTrigger implements MudMenuTriggerHandle {
  /** @description The mud-menu this trigger presents. */
  readonly menu = input.required<MudMenu>({ alias: 'mudMenuTriggerFor' });

  /** @description Fired when the overlay actually opens. */
  readonly opened = output<void>();

  /** @description Fired when the overlay actually closes. */
  readonly closed = output<void>();

  private readonly _overlay = inject(Overlay);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // On an item this is the CONTAINING menu: projected content keeps its declaration-site injector.
  private readonly _parentPanel = inject(MUD_MENU_PANEL, { optional: true });

  /** @docs-private Same-element item when this trigger opens a submenu. */
  readonly _hostItem = inject(MudMenuItem, { optional: true, self: true });

  /** @docs-private */
  readonly isSubmenu = this._hostItem !== null && this._parentPanel !== null;

  /** @docs-private Open submenu below this one, if any. */
  _childTrigger: MudMenuTriggerHandle | null = null;

  private _parentTrigger: MudMenuTriggerHandle | null = null;
  private _overlayRef: OverlayRef | null = null;
  private _outsideSub: Subscription | null = null;
  private _hoverTimer: ReturnType<typeof setTimeout> | null = null;

  /** @docs-private */
  readonly _isOpen = signal(false);

  private _destroyed = false;

  constructor() {
    this._hostItem?._hasSubmenu.set(true);
    inject(DestroyRef).onDestroy(() => {
      this._destroyed = true;
      this._clearHoverTimer();
      this.close(false);
    });
  }

  /** Opens the menu (no-op on the server, when already open, or when the parent chain already closed). */
  open(): void {
    if (!this._isBrowser || this._isOpen()) return;

    if (this.isSubmenu && !this._parentPanel?._attachedTrigger()) return;

    const menu = this.menu();
    const anchor = this._host.nativeElement;
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withViewportMargin(8)
      .withPositions(this.isSubmenu ? submenuPositions(menu.xPosition()) : rootPositions(menu.xPosition(), menu.yPosition()));

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });
    this._overlayRef.attach(new TemplatePortal(menu._panelTemplate(), menu._viewContainerRef));

    menu._attachedTrigger.set(this);
    this._parentTrigger = this._parentPanel?._attachedTrigger() ?? null;

    if (this._parentTrigger) {
      // Opening a sibling submenu supersedes the one already open.
      if (this._parentTrigger._childTrigger && this._parentTrigger._childTrigger !== this) {
        this._parentTrigger._childTrigger.close(false);
      }

      this._parentTrigger._childTrigger = this;
    }

    // Only the chain root watches outside clicks; descendant overlays count as inside via _containsEvent.
    if (!this.isSubmenu) {
      this._outsideSub = this._overlayRef.outsidePointerEvents().subscribe((event) => {
        const target = event.target as Node | null;

        if (target && !this._containsEvent(target)) this.closeAll(false);
      });
    }

    this._isOpen.set(true);
    afterNextRender(() => menu._focusFirst(), { injector: this._injector });
    this.opened.emit();
  }

  /** Closes this level (descendants first); restoreFocus returns focus to the host. */
  close(restoreFocus: boolean): void {
    if (!this._isOpen()) return;

    this._clearHoverTimer();
    this._childTrigger?.close(false);
    this._childTrigger = null;
    this._outsideSub?.unsubscribe();
    this._outsideSub = null;
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this.menu()._attachedTrigger.set(null);

    if (this._parentTrigger?._childTrigger === this) this._parentTrigger._childTrigger = null;

    this._parentTrigger = null;
    this._isOpen.set(false);

    if (restoreFocus) this._host.nativeElement.focus();

    if (!this._destroyed) this.closed.emit();
  }

  /** Closes the whole chain from its root. */
  closeAll(restoreFocus: boolean): void {
    if (this._parentTrigger) this._parentTrigger.closeAll(restoreFocus);
    else this.close(restoreFocus);
  }

  /** Toggles between open and closed. */
  toggle(): void {
    if (this._isOpen()) this.close(true);
    else this.open();
  }

  /** @docs-private True when the node lies inside this trigger, its overlay, or any descendant chain link. */
  _containsEvent(target: Node): boolean {
    if (this._host.nativeElement.contains(target)) return true;

    if (this._overlayRef?.overlayElement.contains(target)) return true;

    return this._childTrigger?._containsEvent(target) ?? false;
  }

  /** @docs-private Delayed close, cancelled by re-hovering. */
  _scheduleClose(): void {
    this._clearHoverTimer();
    this._hoverTimer = setTimeout(() => this.close(false), SUBMENU_HOVER_DELAY_MS);
  }

  protected _onClick(event: MouseEvent): void {
    if (this._hostItem?.disabled()) return;

    // Keeps the click from an ancestor panel; same-element item activation is guarded by _hasSubmenu().
    event.stopPropagation();
    this.toggle();
  }

  protected _onKeydown(event: KeyboardEvent): void {
    if (this.isSubmenu) {
      if (this._hostItem?.disabled()) return;

      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        this.open();
      }

      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
      afterNextRender(() => this.menu()._focusLast(), { injector: this._injector });
    }
  }

  protected _onMouseEnter(): void {
    if (!this.isSubmenu || this._hostItem?.disabled()) return;

    if (this._isOpen()) {
      this._clearHoverTimer();

      return;
    }

    this._clearHoverTimer();
    this._hoverTimer = setTimeout(() => this.open(), SUBMENU_HOVER_DELAY_MS);
  }

  protected _onMouseLeave(): void {
    // Cancel only a PENDING open; an open submenu stays while the pointer heads into its panel.
    if (!this.isSubmenu || this._isOpen()) return;

    this._clearHoverTimer();
  }

  private _clearHoverTimer(): void {
    if (this._hoverTimer !== null) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = null;
    }
  }
}
