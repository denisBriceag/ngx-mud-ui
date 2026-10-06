import { NgTemplateOutlet } from '@angular/common';
import type { ElementRef, QueryList } from '@angular/core';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ViewChildren,
  inject,
  input,
  isSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { CdkStepper } from '@angular/cdk/stepper';
import type { Observable, Subscription } from 'rxjs';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import type { MudStep } from './mud-step.component';
import type { MudStepState } from './mud-step-header.component';
import { MUD_STEP_STATES, MudStepHeader } from './mud-step-header.component';
import { MUD_STEPPER_LABELS } from './stepper-labels';

/** Container width below which a horizontal stepper auto-switches to the compact dot rail. */
const AUTO_COMPACT_MAX_WIDTH = 600;

/** Cancelable payload of {@link MudStepper.stepClick}. */
export interface MudStepperStepClick {
  index: number;
  step: MudStep;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

/**
 * ```html
 * <mud-stepper [linear]="true">
 *   <mud-step label="Identity" [stepControl]="identityForm">…</mud-step>
 *   <mud-step label="Review">…</mud-step>
 * </mud-stepper>
 * ```
 */
@Component({
  selector: 'mud-stepper',
  imports: [NgTemplateOutlet, MudStepHeader],
  providers: [{ provide: CdkStepper, useExisting: MudStepper }],
  template: `
    <div
      #track
      class="stepper"
      [class.stepper--vertical]="orientation === 'vertical'"
      [class.stepper--compact]="_isCompact()"
      role="list"
    >
      @for (step of _stepList(); track step; let i = $index) {
        <div class="stepper-step" [class]="'stepper-step--' + _stateOf(step)" role="listitem">
          <!--
            A real element (not a ::before) so axe can compute the text's
            effective background: ancestor pseudo-elements with a painted
            background make the color-contrast check abstain.
          -->
          <span class="stepper-step__connector" aria-hidden="true"></span>
          <mud-step-header
            [id]="_getStepLabelId(i)"
            [state]="_stateOf(step)"
            [stateLabel]="_stateLabelOf(step)"
            [index]="i"
            [label]="step.label"
            [secondaryText]="_supportingTextOf(step)"
            [tabIndex]="_getFocusIndex() === i ? 0 : -1"
            [attr.aria-current]="selectedIndex === i ? 'step' : null"
            [attr.aria-controls]="_getStepContentId(i)"
            [attr.aria-disabled]="step.isNavigable() ? null : true"
            [attr.aria-label]="step.ariaLabel || null"
            [attr.aria-labelledby]="!step.ariaLabel && step.ariaLabelledby ? step.ariaLabelledby : null"
            (mousedown)="_onHeaderMousedown($event, step)"
            (click)="_onHeaderClick(step)"
            (keydown)="_onHeaderKeydown($event, step)"
          />
          @if (orientation === 'vertical') {
            <div
              class="stepper-step__panel"
              role="region"
              [id]="_getStepContentId(i)"
              [attr.aria-labelledby]="_getStepLabelId(i)"
              [hidden]="selectedIndex !== i"
            >
              <ng-container [ngTemplateOutlet]="step.content" />
            </div>
          }
        </div>
      }
    </div>
    @if (orientation === 'horizontal') {
      <div class="stepper__content">
        @for (step of _stepList(); track step; let i = $index) {
          <div
            class="stepper__panel"
            role="region"
            [id]="_getStepContentId(i)"
            [attr.aria-labelledby]="_getStepLabelId(i)"
            [hidden]="selectedIndex !== i"
          >
            <ng-container [ngTemplateOutlet]="step.content" />
          </div>
        }
      </div>
    }
  `,
  host: {
    class: 'stepper-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudStepper extends CdkStepper {
  /**
   * CdkStepper declares `_stepHeader` as a CONTENT query, but our headers
   * live in this component's view — override with a view query (same
   * pattern as MatStepper) so FocusKeyManager finds them.
   */
  @ViewChildren(MudStepHeader) declare _stepHeader: QueryList<MudStepHeader>;

  /** Only `mud-step` matches the content query, so narrow CdkStepper's typing. */
  declare readonly steps: QueryList<MudStep>;

  /**
   * @description Forces the number-less dot rail (labels visually hidden but still
   * announced). Horizontal steppers also switch to it automatically when
   * their container is narrower than 600px, matching the official stepper.
   */
  readonly compact = input(false, { transform: booleanAttribute });

  /**
   * Emitted before a header activation (click, Enter or Space) selects the
   * step. Call `preventDefault()` on the event to keep the selection unchanged
   * (official mudStepClick contract).
   */
  readonly stepClick = output<MudStepperStepClick>();

  protected readonly _stepList = signal<readonly MudStep[]>([]);

  private readonly _autoCompact = signal(false);

  private readonly _track = viewChild.required<ElementRef<HTMLElement>>('track');

  private readonly _labelsSource = inject(MUD_STEPPER_LABELS);
  private readonly _labels = computed(() =>
    isSignal(this._labelsSource) ? this._labelsSource() : this._labelsSource,
  );

  /** Bumped on reactive-forms statusChanges so _stateOf re-evaluates. */
  private readonly _controlStatus = signal(0);
  private readonly _destroyRef = inject(DestroyRef);
  private _statusSub: Subscription | null = null;
  private _controlSwapSub: Subscription | null = null;

  constructor() {
    super();

    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? 0;

        // A display:none ancestor reports 0; keep the last real measurement.
        if (width > 0) this._autoCompact.set(width < AUTO_COMPACT_MAX_WIDTH);
      });

      observer.observe(this._track().nativeElement);
      this._destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();

    this.steps.changes
      .pipe(startWith(null), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const steps = this.steps.toArray();

        this._stepList.set(steps);
        this._controlSwapSub?.unsubscribe();
        this._controlSwapSub = merge(...steps.map((step) => step._stepControlChanges)).subscribe(
          () => this._watchControls(steps),
        );
        this._watchControls(steps);
      });
    this._destroyRef.onDestroy(() => {
      this._statusSub?.unsubscribe();
      this._controlSwapSub?.unsubscribe();
    });
  }

  /** @docs-private `orientation` is a plain property, so this must not be a computed. */
  protected _isCompact(): boolean {
    return this.compact() || (this.orientation === 'horizontal' && this._autoCompact());
  }

  /**
   * @docs-private Derives the visual state of a step (spec state model).
   * */
  protected _stateOf(step: MudStep): MudStepState {
    this._controlStatus();

    const forced = step.state as MudStepState | undefined;

    if (forced && (MUD_STEP_STATES as readonly string[]).includes(forced)) {
      return forced;
    }

    if (step.isSelected()) {
      return 'current';
    }

    if (step.hasError) {
      return 'blocked';
    }

    if (step.completed) {
      return 'completed';
    }

    return step.isNavigable() ? 'available' : 'incomplete';
  }

  /** @docs-private errorMessage replaces the supporting text while blocked. */
  protected _supportingTextOf(step: MudStep): string | undefined {
    if (this._stateOf(step) === 'blocked' && step.errorMessage) {
      return step.errorMessage;
    }

    return step.supportingText();
  }

  /** @docs-private Screen-reader suffix for the states the glyphs convey only visually. */
  protected _stateLabelOf(step: MudStep): string | undefined {
    const state = this._stateOf(step);

    if (state === 'completed' || state === 'blocked') return this._labels()[state];

    return undefined;
  }

  /** @docs-private A non-navigable header must not take focus on click, like a disabled button. */
  protected _onHeaderMousedown(event: MouseEvent, step: MudStep): void {
    if (!step.isNavigable()) event.preventDefault();
  }

  /** @docs-private */
  protected _onHeaderClick(step: MudStep): void {
    if (!step.isNavigable()) return;

    let prevented = false;
    const event: MudStepperStepClick = {
      index: this._stepList().indexOf(step),
      step,
      get defaultPrevented() {
        return prevented;
      },
      preventDefault() {
        prevented = true;
      },
    };

    this.stepClick.emit(event);

    if (!prevented) step.select();
  }

  /**
   * @docs-private Enter/Space activate the focused header through the same
   * cancelable `stepClick` path as a click; everything else is key-manager
   * navigation. (CdkStepper's own handler would select directly.)
   */
  protected _onHeaderKeydown(event: KeyboardEvent, step: MudStep): void {
    if ((event.key === 'Enter' || event.key === ' ') && !hasModifierKey(event)) {
      event.preventDefault();
      this._onHeaderClick(step);

      return;
    }

    this._onKeydown(event);
  }

  /**
   * Signal-forms fields are functions and already reactive; only
   * reactive-forms controls (objects with statusChanges) need their
   * validity bridged into the signal graph for OnPush/zoneless updates.
   */
  private _watchControls(steps: readonly MudStep[]): void {
    this._statusSub?.unsubscribe();
    this._statusSub = null;

    const observables = steps
      .map((step) => step.stepControl as { statusChanges?: Observable<unknown> } | undefined)
      .filter(
        (control): control is { statusChanges: Observable<unknown> } =>
          !!control && typeof control !== 'function' && !!control.statusChanges,
      )
      .map((control) => control.statusChanges);

    if (observables.length) {
      this._statusSub = merge(...observables).subscribe(() =>
        this._controlStatus.update((v) => v + 1),
      );
    }

    this._controlStatus.update((v) => v + 1);
  }
}
