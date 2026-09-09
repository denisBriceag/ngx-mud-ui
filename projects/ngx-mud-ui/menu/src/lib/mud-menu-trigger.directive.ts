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
  // On an item this resolves the CONTAINING menu (the panel the item lives in),
  // because MUD_MENU_PANEL is provided by MudMenu and projected content keeps
  // its declaration-site injector chain.
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

  constructor() {
    this._hostItem?._hasSubmenu.set(true);
    inject(DestroyRef).onDestroy(() => {
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

    // Only the root of a chain watches outside interactions; clicks inside
    // descendant overlays count as inside via the chain walk.
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

    this.closed.emit();
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

  /** @docs-private Delayed close, cancelled by re-hovering (Task 5 wires callers). */
  _scheduleClose(): void {
    this._clearHoverTimer();
    this._hoverTimer = setTimeout(() => this.close(false), SUBMENU_HOVER_DELAY_MS);
  }

  protected _onClick(event: MouseEvent): void {
    if (this._hostItem?.disabled()) return;

    // stopPropagation doesn't affect MudMenuItem's own (click) on this same
    // element — same-element listeners fire regardless of propagation; the
    // real guard against double handling is _activate()'s _hasSubmenu()
    // early return. What this DOES stop is the click reaching an ANCESTOR
    // panel's keydown/click handling once nested (submenu) triggers exist.
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
    // A pointer that merely crossed the item must not open the submenu later —
    // cancel the PENDING open only. An open submenu stays (the pointer is
    // usually heading into its panel); sibling-hover close owns that case.
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
