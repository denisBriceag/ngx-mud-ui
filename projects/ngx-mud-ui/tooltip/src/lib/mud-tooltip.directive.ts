import {
  booleanAttribute,
  computed,
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
import { MudTooltipContainer } from './mud-tooltip-container.component';
import { connectedPositionsFor } from './tooltip-positions';
import type { MudTooltipPlacement, MudTooltipSize } from './tooltip-positions';

let nextUniqueId = 0;

export type MudTooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type MudTooltipVariant = 'default' | 'coach';
export type MudTooltipCloseReason =
  | 'blur'
  | 'escape'
  | 'close-button'
  | 'click-outside'
  | 'click-trigger';

/**
 * ```html
 * <button mudTooltip="Saved successfully!" tooltipPlacement="top-center" tooltipSize="large">
 *   Save
 * </button>
 * <button mudTooltip="Try the new filters here." tooltipVariant="coach" tooltipTitle="New!">
 *   Filters
 * </button>
 * ```
 */
@Directive({
  selector: '[mudTooltip]',
  exportAs: 'mudTooltip',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusin)': 'onFocus()',
    '(focusout)': 'onBlur()',
    '(click)': 'onClick()',
  },
})
export class MudTooltip {
  private readonly _overlay = inject(Overlay);
  private readonly _host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @description Tooltip text. Optional: an empty tooltip never opens. */
  readonly mudTooltip = input('');

  private readonly _pushedContent = signal<string | null>(null);
  private readonly _pushedAnchor = signal<HTMLElement | null>(null);
  private _describedElement: HTMLElement | null = null;

  /** Content for host directives that decide the text themselves. */
  setContent(text: string | null): void {
    this._pushedContent.set(text);
  }

  /**
   * @description Points positioning and `aria-describedby` at a descendant instead of the host.
   * For a wrapper host (breadcrumb's `<li>`) the host is neither focusable nor the
   * element a screen reader describes, so both must move to the inner control.
   */
  setAnchor(element: HTMLElement | null): void {
    this._pushedAnchor.set(element);
  }

  private get _trigger(): HTMLElement {
    return this._pushedAnchor() ?? this._host;
  }

  readonly content = computed(() => this.mudTooltip() || this._pushedContent() || '');
  readonly tooltipPlacement = input<MudTooltipPlacement>('top-center');
  readonly tooltipSize = input<MudTooltipSize>('small');
  /**
   * @description What opens the tooltip. `hover` also opens on focus; `manual`
   * only reacts to `show()`/`hide()`. Coach tooltips ignore hover/focus paths.
   */
  readonly tooltipTrigger = input<MudTooltipTrigger>('hover');
  /**
   * @description `coach` is the persistent onboarding bubble: it stays open until
   * Escape, the close button, or an outside click, and shows a hint line.
   */
  readonly tooltipVariant = input<MudTooltipVariant>('default');
  /** @description Optional bold title line rendered above the message. */
  readonly tooltipTitle = input<string | undefined>(undefined);
  /** @description Hint line shown by coach tooltips. Localize per app. */
  readonly tooltipCoachHint = input('Press Esc to close');
  /**
   * @description Keeps the bubble open while the pointer is over it (so links inside
   * stay reachable). Off by default, matching the official tooltip.
   */
  readonly tooltipInteractive = input(false, { transform: booleanAttribute });
  readonly tooltipCloseable = input(false, { transform: booleanAttribute });
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });
  /** @description Off when the tooltip only repeats the trigger's accessible name (it would be read twice). */
  readonly tooltipDescribesTrigger = input(true, { transform: booleanAttribute });
  readonly tooltipMaxWidth = input('280px');
  readonly tooltipShowDelay = input(200, { transform: numberAttribute });
  readonly tooltipHideDelay = input(150, { transform: numberAttribute });
  readonly tooltipCloseAriaLabel = input('Close');

  /** Emitted when the tooltip closes for a user-initiated reason. */
  readonly tooltipDismissed = output<MudTooltipCloseReason>();

  private readonly _id = `mud-tooltip-${nextUniqueId++}`;

  private _overlayRef: OverlayRef | null = null;
  private readonly _containerRef = signal<ComponentRef<MudTooltipContainer> | null>(null);
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
    this._dismiss('escape');
  };

  private get _isCoach(): boolean {
    return this.tooltipVariant() === 'coach';
  }

  /** Coach tooltips behave like click-triggered ones regardless of trigger. */
  private get _effectiveTrigger(): MudTooltipTrigger {
    return this._isCoach ? 'click' : this.tooltipTrigger();
  }

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

      container.setInput('message', this.content());
      container.setInput('size', this.tooltipSize());
      container.setInput('closeable', this.tooltipCloseable() || this._isCoach);
      container.setInput('closeAriaLabel', this.tooltipCloseAriaLabel());
      container.setInput('maxWidth', this.tooltipMaxWidth());
      container.setInput('title', this.tooltipTitle());
      container.setInput('variant', this.tooltipVariant());
      container.setInput('coachHint', this.tooltipCoachHint());
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

  /** @description True while the bubble is attached, whoever opened or closed it. */
  get isOpen(): boolean {
    return this._overlayRef?.hasAttached() ?? false;
  }

  protected onMouseEnter(): void {
    if (this._effectiveTrigger !== 'hover') return;

    this._scheduleShow(this.tooltipShowDelay());
  }

  protected onMouseLeave(): void {
    if (this._effectiveTrigger !== 'hover') return;

    this._scheduleHide();
  }

  protected onFocus(): void {
    const trigger = this._effectiveTrigger;

    if (trigger !== 'hover' && trigger !== 'focus') return;

    this._scheduleShow(0);
  }

  protected onBlur(): void {
    const trigger = this._effectiveTrigger;

    if (trigger !== 'hover' && trigger !== 'focus') return;

    this._scheduleHide();
  }

  protected onClick(): void {
    if (this.tooltipDisabled()) return;

    if (this._effectiveTrigger !== 'click') return;

    if (this._overlayRef?.hasAttached()) {
      this._dismiss('click-trigger');
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
   * @description Hides after the hide delay so the pointer can travel onto an
   * interactive bubble before it disappears.
   * */
  private _scheduleHide(): void {
    if (this._pinned) return;

    this._clearTimeouts();
    this._hideTimeout = setTimeout(() => this._dismiss('blur'), this.tooltipHideDelay());
  }

  private _attach(): void {
    /**
     * DOM events never fire during SSR, but show() may be called from app code
     * so we never build an overlay on the server.
     * */
    if (!this._isBrowser) return;

    if (this.content().length === 0) return;

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

    const containerRef: ComponentRef<MudTooltipContainer> = this._overlayRef.attach(
      new ComponentPortal(MudTooltipContainer),
    );

    containerRef.setInput('tooltipId', this._id);
    containerRef.setInput('message', this.content());
    containerRef.setInput('placement', this.tooltipPlacement());
    containerRef.setInput('size', this.tooltipSize());
    containerRef.setInput('closeable', this.tooltipCloseable() || this._isCoach);
    containerRef.setInput('closeAriaLabel', this.tooltipCloseAriaLabel());
    containerRef.setInput('maxWidth', this.tooltipMaxWidth());
    containerRef.setInput('title', this.tooltipTitle());
    containerRef.setInput('variant', this.tooltipVariant());
    containerRef.setInput('coachHint', this.tooltipCoachHint());
    this._containerRef.set(containerRef);

    /**
     * When the preferred placement doesn't fit, CDK falls back to another
     * position — mirror the placement that actually applied so the arrow moves with it.
     * */
    positionStrategy.positionChanges.subscribe((change) => {
      const applied = positions.find((p) => p.position === change.connectionPair);

      if (applied) containerRef.setInput('placement', applied.placement);
    });

    containerRef.instance.closed.subscribe(() => this._dismiss('close-button'));

    // Hovering the bubble keeps it open only for interactive tooltips
    // (official behavior); otherwise leaving the trigger hides it.
    if (this.tooltipInteractive()) {
      containerRef.instance.hovered.subscribe((inside) => {
        if (inside) {
          this._clearTimeouts();
        } else {
          this._scheduleHide();
        }
      });
    }

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      // The HOST, not the anchor: with a wrapper host the anchor is a subset of
      // it, and a click on the wrapper's own padding is still "on the trigger".
      if (this._pinned && target && !this._host.contains(target)) this._dismiss('click-outside');
    });

    this._pinned = this.tooltipCloseable() || this._isCoach;

    /**
     * aria-describedby is a token list the trigger may already use (form hints etc.)
     * append rather than replace, and remove only our own token again on detach.
     * */
    if (this.tooltipDescribesTrigger()) {
      const described = this._trigger;
      const describedby = described.getAttribute('aria-describedby');

      described.setAttribute('aria-describedby', describedby ? `${describedby} ${this._id}` : this._id);
      this._describedElement = described;
    }

    this._document.addEventListener('keydown', this._onDocumentKeydown, { capture: true });
  }

  private _dismiss(reason: MudTooltipCloseReason): void {
    if (!this._overlayRef?.hasAttached()) return;

    this._detach();
    this.tooltipDismissed.emit(reason);
  }

  private _detach(): void {
    this._clearTimeouts();
    this._pinned = false;
    this._containerRef.set(null);
    this._document.removeEventListener('keydown', this._onDocumentKeydown, { capture: true });

    const described = this._describedElement;
    const describedby = described?.getAttribute('aria-describedby') ?? null;

    if (described && describedby !== null) {
      const rest = describedby
        .split(/\s+/)
        .filter((token: string) => token && token !== this._id)
        .join(' ');

      if (rest) {
        described.setAttribute('aria-describedby', rest);
      } else {
        described.removeAttribute('aria-describedby');
      }
    }

    this._describedElement = null;

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
