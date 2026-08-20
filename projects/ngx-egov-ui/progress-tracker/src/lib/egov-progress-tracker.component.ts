import { NgTemplateOutlet } from '@angular/common';
import type { QueryList } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkStepper } from '@angular/cdk/stepper';
import type { Observable, Subscription } from 'rxjs';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import type { EgovStep } from './egov-step.component';
import type { EgovStepState } from './egov-step-header.component';
import { EGOV_STEP_STATES, EgovStepHeader } from './egov-step-header.component';

/**
 * ```html
 * <egov-progress-tracker [linear]="true">
 *   <egov-step label="Identity" [stepControl]="identityForm">…</egov-step>
 *   <egov-step label="Review">…</egov-step>
 * </egov-progress-tracker>
 * ```
 */
@Component({
  selector: 'egov-progress-tracker',
  imports: [NgTemplateOutlet, EgovStepHeader],
  providers: [{ provide: CdkStepper, useExisting: EgovProgressTracker }],
  template: `
    <div
      class="progress-tracker"
      [class.progress-tracker--vertical]="orientation === 'vertical'"
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
          <egov-step-header
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
export class EgovProgressTracker extends CdkStepper {
  /**
   * CdkStepper declares `_stepHeader` as a CONTENT query, but our headers
   * live in this component's view — override with a view query (same
   * pattern as MatStepper) so FocusKeyManager finds them.
   */
  @ViewChildren(EgovStepHeader) declare _stepHeader: QueryList<EgovStepHeader>;

  protected readonly _stepList = signal<readonly EgovStep[]>([]);

  /** Bumped on reactive-forms statusChanges so _stateOf re-evaluates. */
  private readonly _controlStatus = signal(0);
  private readonly _destroyRef = inject(DestroyRef);
  private _statusSub: Subscription | null = null;

  override ngAfterContentInit(): void {
    super.ngAfterContentInit();

    this.steps.changes
      .pipe(startWith(null), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        const steps = this.steps.toArray() as EgovStep[];

        this._stepList.set(steps);
        this._watchControls(steps);
      });
    this._destroyRef.onDestroy(() => this._statusSub?.unsubscribe());
  }

  /**
   * @docs-private Derives the visual state of a step (spec state model).
   * */
  protected _stateOf(step: EgovStep): EgovStepState {
    this._controlStatus();

    const forced = step.state as EgovStepState | undefined;

    if (forced && (EGOV_STEP_STATES as readonly string[]).includes(forced)) {
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
  protected _supportingTextOf(step: EgovStep): string | undefined {
    if (this._stateOf(step) === 'blocked' && step.errorMessage) {
      return step.errorMessage;
    }

    return step.supportingText();
  }

  /** @docs-private */
  protected _onHeaderClick(step: EgovStep): void {
    if (step.isNavigable()) {
      step.select();
    }
  }

  /**
   * Signal-forms fields are functions and already reactive; only
   * reactive-forms controls (objects with statusChanges) need their
   * validity bridged into the signal graph for OnPush/zoneless updates.
   */
  private _watchControls(steps: readonly EgovStep[]): void {
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
