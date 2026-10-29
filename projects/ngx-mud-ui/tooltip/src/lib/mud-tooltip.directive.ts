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
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
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
 * <button mudTooltip="Saved successfully!" tooltipPlacement="top-center" tooltipSize="lg">
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

  /** @description Moves positioning and `aria-describedby` to a descendant, for non-focusable wrapper hosts. */
  setAnchor(element: HTMLElement | null): void {
    this._pushedAnchor.set(element);
  }

  private get _trigger(): HTMLElement {
    return this._pushedAnchor() ?? this._host;
  }

  readonly content = computed(() => this.mudTooltip() || this._pushedContent() || '');
  /** @description Preferred side and alignment; flips when there isn't room. */
  readonly tooltipPlacement = input<MudTooltipPlacement>('top-center');
  /** @description Text size and padding. */
  readonly tooltipSize = input<MudTooltipSize>('sm');
  /** @description What opens the tooltip; `hover` also opens on focus, `manual` only reacts to `show()`/`hide()`. */
  readonly tooltipTrigger = input<MudTooltipTrigger>('hover');
  /** @description `coach` stays open until Escape, the close button or an outside click, and shows a hint line. */
  readonly tooltipVariant = input<MudTooltipVariant>('default');
  /** @description Optional bold title line rendered above the message. */
  readonly tooltipTitle = input<string | undefined>(undefined);
  /** @description Hint line shown by coach tooltips. Unset or blank follows the app labels (`tooltip.coachHint`). */
  readonly tooltipCoachHint = input<string | undefined>(undefined);
  /** @description Keeps the bubble open while the pointer is over it. */
  readonly tooltipInteractive = input(false, { transform: booleanAttribute });
  /** @description Shows a close button in the bubble. */
  readonly tooltipClosable = input(false, { transform: booleanAttribute });
  /** @description Never opens the tooltip. */
  readonly tooltipDisabled = input(false, { transform: booleanAttribute });
  /** @description Off when the tooltip only repeats the trigger's accessible name (it would be read twice). */
  readonly tooltipDescribesTrigger = input(true, { transform: booleanAttribute });
  /** @description Maximum bubble width, any CSS length. */
  readonly tooltipMaxWidth = input('280px');
  /** @description Delay in ms before a hover opens the tooltip. */
  readonly tooltipShowDelay = input(200, { transform: numberAttribute });
  /** @description Delay in ms before the tooltip hides after the pointer leaves. */
  readonly tooltipHideDelay = input(150, { transform: numberAttribute });
  /** @description Accessible name of the close button; defaults to the app labels. */
  readonly tooltipCloseLabel = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();
  private readonly _closeText = computed(() => _mudText(this.tooltipCloseLabel(), this._labels().tooltip.close));
  private readonly _coachHintText = computed(() => _mudText(this.tooltipCoachHint(), this._labels().tooltip.coachHint));

  /** @description Fires when the user closes the tooltip, with the reason. */
  readonly tooltipClosed = output<MudTooltipCloseReason>();

  private readonly _id = `mud-tooltip-${nextUniqueId++}`;

  private _overlayRef: OverlayRef | null = null;
  private readonly _containerRef = signal<ComponentRef<MudTooltipContainer> | null>(null);
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _pinned = false;

  /** Capture phase so a consumed Escape closes only the tooltip, not an enclosing dialog. */
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

    // Attach-time setInput calls are snapshots; this syncs an open tooltip (placement stays attach-time).
    effect(() => {
      const container = this._containerRef();

      if (!container) return;

      container.setInput('message', this.content());
      container.setInput('size', this.tooltipSize());
      container.setInput('closable', this.tooltipClosable() || this._isCoach);
      container.setInput('closeLabel', this._closeText());
      container.setInput('maxWidth', this.tooltipMaxWidth());
      container.setInput('title', this.tooltipTitle());
      container.setInput('variant', this.tooltipVariant());
      container.setInput('coachHint', this._coachHintText());
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

  /** Delayed so the pointer can travel onto an interactive bubble. */
  private _scheduleHide(): void {
    if (this._pinned) return;

    this._clearTimeouts();
    this._hideTimeout = setTimeout(() => this._dismiss('blur'), this.tooltipHideDelay());
  }

  private _attach(): void {
    // show() may be called from app code during SSR.
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

    // The close scroll strategy detaches behind our back; cleanup must follow every detachment.
    this._overlayRef.detachments().subscribe(() => this._detach());

    const containerRef: ComponentRef<MudTooltipContainer> = this._overlayRef.attach(
      new ComponentPortal(MudTooltipContainer),
    );

    containerRef.setInput('tooltipId', this._id);
    containerRef.setInput('message', this.content());
    containerRef.setInput('placement', this.tooltipPlacement());
    containerRef.setInput('size', this.tooltipSize());
    containerRef.setInput('closable', this.tooltipClosable() || this._isCoach);
    containerRef.setInput('closeLabel', this._closeText());
    containerRef.setInput('maxWidth', this.tooltipMaxWidth());
    containerRef.setInput('title', this.tooltipTitle());
    containerRef.setInput('variant', this.tooltipVariant());
    containerRef.setInput('coachHint', this._coachHintText());
    this._containerRef.set(containerRef);

    // Mirror the placement CDK actually applied so the arrow follows fallbacks.
    positionStrategy.positionChanges.subscribe((change) => {
      const applied = positions.find((p) => p.position === change.connectionPair);

      if (applied) containerRef.setInput('placement', applied.placement);
    });

    containerRef.instance.closed.subscribe(() => this._dismiss('close-button'));

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

      // The host, not the anchor: a click on a wrapper host's padding is still on the trigger.
      if (this._pinned && target && !this._host.contains(target)) this._dismiss('click-outside');
    });

    this._pinned = this.tooltipClosable() || this._isCoach;

    // Append to the trigger's existing describedby tokens; remove only our own on detach.
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
    this.tooltipClosed.emit(reason);
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
