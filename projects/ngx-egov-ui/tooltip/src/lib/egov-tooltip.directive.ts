import {
  booleanAttribute,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import type { ComponentRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EgovTooltipContainer } from './egov-tooltip-container.component';
import { connectedPositionsFor } from './tooltip-positions';
import type { EgovTooltipPlacement, EgovTooltipSize } from './tooltip-positions';

let nextUniqueId = 0;

/**
 * ```html
 * <button egovTooltip="Saved successfully!" tooltipPlacement="top-center" tooltipSize="large">
 *   Save
 * </button>
 * ```
 */
@Directive({
  selector: '[egovTooltip]',
  exportAs: 'egovTooltip',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(click)': 'onClick()',
  },
})
export class EgovTooltip {
  private readonly _overlay = inject(Overlay);
  private readonly _trigger = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly egovTooltip = input.required<string>();
  readonly tooltipPlacement = input<EgovTooltipPlacement>('top-center');
  readonly tooltipSize = input<EgovTooltipSize>('small');
  readonly tooltipCloseable = input(false, { transform: booleanAttribute });
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });
  readonly tooltipMaxWidth = input('240px');
  readonly tooltipShowDelay = input(300, { transform: numberAttribute });
  readonly tooltipCloseAriaLabel = input('Close');

  readonly tooltipDismissed = output<void>();

  private readonly _id = `egov-tooltip-${nextUniqueId++}`;

  private _overlayRef: OverlayRef | null = null;
  private readonly _containerRef = signal<ComponentRef<EgovTooltipContainer> | null>(null);
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _pinned = false;

  /**
   * @description Registered in the capture phase (only while the tooltip is open) so a
   * consumed Escape closes just the tooltip, not an enclosing dialog too.
   * */
  private readonly _onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;

    event.stopPropagation();
    this._dismiss();
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this._detach());

    /**
     * @description The attach-time setInput calls are one-shot snapshots; this keeps an
     * open tooltip in sync when its inputs change (e.g. "Copy" → "Copied!").
     * Placement stays attach-time - the position strategy is built from it.
     * */
    effect(() => {
      const container = this._containerRef();

      if (!container) return;

      container.setInput('message', this.egovTooltip());
      container.setInput('size', this.tooltipSize());
      container.setInput('closeable', this.tooltipCloseable());
      container.setInput('closeAriaLabel', this.tooltipCloseAriaLabel());
      container.setInput('maxWidth', this.tooltipMaxWidth());
    });
  }

  show(): void {
    if (this.tooltipDisabled()) return;

    this._clearTimeouts();
    this._attach();
    this._pinned = true;
  }

  hide(): void {
    this._detach();
  }

  protected onMouseEnter(): void {
    this._scheduleShow(this.tooltipShowDelay());
  }

  protected onMouseLeave(): void {
    this._scheduleHide();
  }

  protected onFocus(): void {
    this._scheduleShow(0);
  }

  protected onBlur(): void {
    this._scheduleHide();
  }

  protected onClick(): void {
    if (this.tooltipDisabled()) return;

    if (this._pinned) {
      this._dismiss();
    } else {
      this._clearTimeouts();
      this._attach();

      this._pinned = true;
    }
  }

  private _scheduleShow(delay: number): void {
    if (this.tooltipDisabled()) return;

    this._clearTimeouts();

    if (this._overlayRef?.hasAttached()) return;

    this._showTimeout = setTimeout(() => this._attach(), delay);
  }

  /**
   * @description Hides after a task-queue turn so the pointer can travel onto the bubble.
   * */
  private _scheduleHide(): void {
    if (this._pinned) return;

    this._clearTimeouts();
    this._hideTimeout = setTimeout(() => this._detach(), 0);
  }

  private _attach(): void {
    /**
     * DOM events never fire during SSR, but show() may be called from app code
     * so we never build an overlay on the server.
     * */
    if (!this._isBrowser) return;

    if (this._overlayRef?.hasAttached()) return;

    const positions = connectedPositionsFor(this.tooltipPlacement());
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._trigger)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withPush(true)
      .withPositions(positions.map((p) => p.position));

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.close(),
    });

    /**
     * The close scroll strategy detaches the overlay behind our back, so the
     * trigger cleanup (aria-describedby, keydown listener, pinned state) must
     * follow every detachment, not only the ones this directive initiates.
     * */
    this._overlayRef.detachments().subscribe(() => this._detach());

    const containerRef: ComponentRef<EgovTooltipContainer> = this._overlayRef.attach(
      new ComponentPortal(EgovTooltipContainer),
    );

    containerRef.setInput('tooltipId', this._id);
    containerRef.setInput('message', this.egovTooltip());
    containerRef.setInput('placement', this.tooltipPlacement());
    containerRef.setInput('size', this.tooltipSize());
    containerRef.setInput('closeable', this.tooltipCloseable());
    containerRef.setInput('closeAriaLabel', this.tooltipCloseAriaLabel());
    containerRef.setInput('maxWidth', this.tooltipMaxWidth());
    this._containerRef.set(containerRef);

    /**
     * When the preferred placement doesn't fit, CDK falls back to another
     * position — mirror the placement that actually applied so the arrow moves with it.
     * */
    positionStrategy.positionChanges.subscribe((change) => {
      const applied = positions.find((p) => p.position === change.connectionPair);

      if (applied) containerRef.setInput('placement', applied.placement);
    });

    containerRef.instance.closed.subscribe(() => this._dismiss());

    containerRef.instance.hovered.subscribe((inside) => {
      if (inside) {
        this._clearTimeouts();
      } else {
        this._scheduleHide();
      }
    });

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (this._pinned && target && !this._trigger.contains(target)) this._dismiss();
    });

    this._pinned = this.tooltipCloseable();

    /**
     * aria-describedby is a token list the trigger may already use (form hints etc.)
     * append rather than replace, and remove only our own token again on detach.
     * */
    const describedby = this._trigger.getAttribute('aria-describedby');

    this._trigger.setAttribute(
      'aria-describedby',
      describedby ? `${describedby} ${this._id}` : this._id,
    );
    this._document.addEventListener('keydown', this._onDocumentKeydown, { capture: true });
  }

  private _dismiss(): void {
    if (!this._overlayRef?.hasAttached()) return;

    this._detach();
    this.tooltipDismissed.emit();
  }

  private _detach(): void {
    this._clearTimeouts();
    this._pinned = false;
    this._containerRef.set(null);
    this._document.removeEventListener('keydown', this._onDocumentKeydown, { capture: true });

    const describedby = this._trigger.getAttribute('aria-describedby');

    if (describedby !== null) {
      const rest = describedby
        .split(/\s+/)
        .filter((token: string) => token && token !== this._id)
        .join(' ');

      if (rest) {
        this._trigger.setAttribute('aria-describedby', rest);
      } else {
        this._trigger.removeAttribute('aria-describedby');
      }
    }

    this._overlayRef?.dispose();
    this._overlayRef = null;
  }

  private _clearTimeouts(): void {
    if (this._showTimeout !== null) clearTimeout(this._showTimeout);

    if (this._hideTimeout !== null) clearTimeout(this._hideTimeout);

    this._showTimeout = null;
    this._hideTimeout = null;
  }
}
