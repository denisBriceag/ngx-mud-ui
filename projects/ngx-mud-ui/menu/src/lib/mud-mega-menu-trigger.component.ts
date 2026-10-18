import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import type { GlobalPositionStrategy, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { Subscription } from 'rxjs';

import type { MudMegaMenu } from './mud-mega-menu.component';
import { MudMegaMenuOrigin } from './mud-mega-menu-origin.directive';
import type { MudMegaMenuTriggerHandle } from './mud-mega-menu.types';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudMegaMenuStyles } from './mud-mega-menu-styles.component';

let nextTriggerId = 0;

/**
 * ```html
 * <header mudMegaMenuOrigin>
 *   <button [mudMegaMenuTriggerFor]="services">Servicii</button>
 * </header>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[mudMegaMenuTriggerFor]',
  template: `
    <span class="mega-menu-trigger__label"><ng-content /></span>
    <svg class="mega-menu-trigger__chevron" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06"
      />
    </svg>
  `,
  host: {
    class: 'mega-menu-trigger',
    type: 'button',
    '[class.is-open]': '_isOpen()',
    '[attr.aria-expanded]': '_isOpen()',
    '[attr.aria-controls]': '_isOpen() && _attachedMenu ? _attachedMenu._panelId : null',
    '(click)': 'toggle()',
    '(keydown)': '_onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudMegaMenuTrigger implements MudMegaMenuTriggerHandle {
  /** @description The mud-mega-menu this button presents. */
  readonly menu = input.required<MudMegaMenu>({ alias: 'mudMegaMenuTriggerFor' });

  /** @description Fired when the panel actually opens. */
  readonly opened = output<void>();

  /** @description Fired when the panel actually closes. */
  readonly closed = output<void>();

  private readonly _overlay = inject(Overlay);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _origin = inject(MudMegaMenuOrigin, { optional: true });

  /** @docs-private */
  readonly _hostElement = this._host.nativeElement;

  /** @docs-private */
  readonly _isOpen = signal(false);

  /** @docs-private The menu this open panel belongs to (the binding may switch while open). */
  _attachedMenu: MudMegaMenu | null = null;

  private _overlayRef: OverlayRef | null = null;
  private _outsideSub: Subscription | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _globalStrategy: GlobalPositionStrategy | null = null;
  private _destroyed = false;

  constructor() {
    inject(MudStyleLoader).load(_MudMegaMenuStyles);

    inject(DestroyRef).onDestroy(() => {
      this._destroyed = true;
      this.close(false);
    });
  }

  /** Opens the panel (no-op on the server or when already open); closes a sibling sharing the origin. */
  open(): void {
    if (!this._isBrowser || this._destroyed || this._isOpen()) return;

    const menu = this.menu();

    if (!menu) return;

    const holder = menu._attachedTrigger();

    if (holder && holder !== this) holder.close(false);

    const origin = this._origin;

    if (origin?._openTrigger && origin._openTrigger !== this) origin._openTrigger.close(false);

    const overlayRef = this._overlay.create({
      positionStrategy: this._positionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      ...this._paneSize(),
    });

    this._overlayRef = overlayRef;
    this._attachedMenu = menu;
    menu._attachedTrigger.set(this);

    const host = this._hostElement;

    if (!host.id) host.id = `mud-mega-menu-trigger-${nextTriggerId++}`;

    menu._triggerId.set(host.id);
    overlayRef.attach(new TemplatePortal(menu._panelTemplate(), menu._viewContainerRef));

    if (origin) origin._openTrigger = this;

    this._outsideSub = overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && this._hostElement.contains(target)) return;

      this.close(false);
    });

    this._watchSize();
    this._isOpen.set(true);
    this.opened.emit();
  }

  /** Closes the panel; restoreFocus returns focus to the button. */
  close(restoreFocus: boolean): void {
    if (!this._isOpen()) return;

    this._outsideSub?.unsubscribe();
    this._outsideSub = null;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    window.removeEventListener('resize', this._refit);
    window.removeEventListener('scroll', this._refit, { capture: true });
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._globalStrategy = null;
    this._attachedMenu?._attachedTrigger.set(null);
    this._attachedMenu = null;

    if (this._origin?._openTrigger === this) this._origin._openTrigger = null;

    this._isOpen.set(false);

    if (restoreFocus) this._hostElement.focus();

    if (!this._destroyed) this.closed.emit();
  }

  /** Toggles between open and closed. */
  toggle(): void {
    if (this._isOpen()) this.close(true);
    else this.open();
  }

  protected _onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        afterNextRender(() => this._focusFirstLink(), { injector: this._injector });
        break;
      case 'Escape':
        if (this._isOpen()) {
          event.preventDefault();
          this.close(true);
        }

        break;
      case 'Tab':
        if (!this._isOpen()) return;

        if (event.shiftKey) {
          this.close(false);
        } else {
          if (this._focusFirstLink()) event.preventDefault();
        }

        break;
    }
  }

  private _focusFirstLink(): boolean {
    const link = this._overlayRef?.overlayElement.querySelector<HTMLElement>('.mega-menu__link');

    link?.focus();

    return !!link && document.activeElement === link;
  }

  private _positionStrategy(): PositionStrategy {
    if (this._origin) {
      return this._overlay
        .position()
        .flexibleConnectedTo(this._origin._element)
        .withFlexibleDimensions(true)
        .withPush(false)
        .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]);
    }

    const rect = this._hostElement.getBoundingClientRect();

    this._globalStrategy = this._overlay.position().global().left('0').top(`${rect.bottom}px`);

    return this._globalStrategy;
  }

  private _paneSize(): { width: number | string; maxHeight?: number } {
    if (this._origin) return { width: this._origin._element.nativeElement.getBoundingClientRect().width };

    return { width: '100vw', maxHeight: Math.max(0, window.innerHeight - this._hostElement.getBoundingClientRect().bottom) };
  }

  private _watchSize(): void {
    if (this._origin) {
      if (typeof ResizeObserver === 'undefined') return;

      this._resizeObserver = new ResizeObserver(() => this._refit());
      this._resizeObserver.observe(this._origin._element.nativeElement);
    } else {
      window.addEventListener('resize', this._refit);
      window.addEventListener('scroll', this._refit, { capture: true, passive: true });
    }
  }

  private readonly _refit = (): void => {
    const overlayRef = this._overlayRef;

    if (!overlayRef) return;

    if (this._globalStrategy) {
      const rect = this._hostElement.getBoundingClientRect();

      this._globalStrategy.top(`${rect.bottom}px`);
      overlayRef.updateSize({ width: '100vw', maxHeight: Math.max(0, window.innerHeight - rect.bottom) });
    } else {
      overlayRef.updateSize(this._paneSize());
    }

    overlayRef.updatePosition();
  };
}
