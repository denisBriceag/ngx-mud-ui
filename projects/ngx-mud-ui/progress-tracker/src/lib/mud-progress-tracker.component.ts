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
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkStepper } from '@angular/cdk/stepper';
import type { Observable, Subscription } from 'rxjs';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import type { MudStep } from './mud-step.component';
import type { MudStepState } from './mud-step-header.component';
import { MUD_STEP_STATES, MudStepHeader } from './mud-step-header.component';

/** Container width below which a horizontal tracker auto-switches to the compact dot rail. */
const AUTO_COMPACT_MAX_WIDTH = 600;

/** Cancelable payload of {@link MudProgressTracker.stepClick}. */
export interface MudProgressTrackerStepClick {
  index: number;
  step: MudStep;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

/**
 * ```html
 * <mud-progress-tracker [linear]="true">
 *   <mud-step label="Identity" [stepControl]="identityForm">…</mud-step>
 *   <mud-step label="Review">…</mud-step>
 * </mud-progress-tracker>
 * ```
 */
@Component({
  selector: 'mud-progress-tracker',
  imports: [NgTemplateOutlet, MudStepHeader],
  providers: [{ provide: CdkStepper, useExisting: MudProgressTracker }],
  template: `
    <div
      #track
      class="progress-tracker"
      [class.progress-tracker--vertical]="orientation === 'vertical'"
      [class.progress-tracker--compact]="_isCompact()"
      role="list"
    >
      @for (step of _stepList(); track step; let i = $index) {
        <div class="progress-step" [class]="'progress-step--' + _stateOf(step)" role="listitem">
          <!--
            A real element (not a ::before) so axe can compute the text's
            effective background: ancestor pseudo-elements with a painted
            background make the color-contrast check abstain.
          -->
          <span class="progress-step__connector" aria-hidden="true"></span>
          <mud-step-header
            [id]="_getStepLabelId(i)"
            [state]="_stateOf(step)"
            [index]="i"
            [label]="step.label"
            [secondaryText]="_supportingTextOf(step)"
            [tabIndex]="_getFocusIndex() === i ? 0 : -1"
            [attr.aria-current]="selectedIndex === i ? 'step' : null"
            [attr.aria-controls]="_getStepContentId(i)"
            [attr.aria-disabled]="step.isNavigable() ? null : true"
            [attr.aria-label]="step.ariaLabel || null"
            [attr.aria-labelledby]="!step.ariaLabel && step.ariaLabelledby ? step.ariaLabelledby : null"
            (click)="_onHeaderClick(step)"
            (keydown)="_onKeydown($event)"
          />
          @if (orientation === 'vertical') {
            <div
              class="progress-step__panel"
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
      <div class="progress-tracker__content">
        @for (step of _stepList(); track step; let i = $index) {
          <div
            class="progress-tracker__panel"
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
    class: 'progress-tracker-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudProgressTracker extends CdkStepper {
  /**
   * CdkStepper declares `_stepHeader` as a CONTENT query, but our headers
   * live in this component's view — override with a view query (same
   * pattern as MatStepper) so FocusKeyManager finds them.
   */
  @ViewChildren(MudStepHeader) declare _stepHeader: QueryList<MudStepHeader>;

  /**
   * @description Forces the number-less dot rail (labels visually hidden but still
   * announced). Horizontal trackers also switch to it automatically when
   * their container is narrower than 600px, matching the official tracker.
   */
  readonly compact = input(false, { transform: booleanAttribute });

  /**
   * Emitted before a click on an actionable header selects the step. Call
   * `preventDefault()` on the event to keep the selection unchanged
   * (official mudStepClick contract).
   */
  readonly stepClick = output<MudProgressTrackerStepClick>();

  protected readonly _stepList = signal<readonly MudStep[]>([]);

  private readonly _autoCompact = signal(false);
  protected readonly _isCompact = computed(
    () => this.compact() || (this.orientation === 'horizontal' && this._autoCompact()),
  );

  private readonly _track = viewChild.required<ElementRef<HTMLElement>>('track');

  /** Bumped on reactive-forms statusChanges so _stateOf re-evaluates. */
  private readonly _controlStatus = signal(0);
  private readonly _destroyRef = inject(DestroyRef);
  private _statusSub: Subscription | null = null;

  constructor() {
    super();

    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? Number.POSITIVE_INFINITY;

        this._autoCompact.set(width < AUTO_COMPACT_MAX_WIDTH);
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
        const steps = this.steps.toArray() as MudStep[];

        this._stepList.set(steps);
        this._watchControls(steps);
      });
    this._destroyRef.onDestroy(() => this._statusSub?.unsubscribe());
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

  /** @docs-private */
  protected _onHeaderClick(step: MudStep): void {
    if (!step.isNavigable()) return;

    let prevented = false;
    const event: MudProgressTrackerStepClick = {
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
  }
}
