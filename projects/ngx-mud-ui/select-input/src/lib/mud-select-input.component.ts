import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef, TemplateRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

export type MudSelectInputVariant = 'default' | 'destructive';
export type MudSelectInputSize = 'medium' | 'large';

export interface MudSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

let nextUniqueId = 0;

/**
 * ```html
 * <mud-select-input label="Raion" [options]="raions" [formControl]="raion" />
 * ```
 */
@Component({
  selector: 'mud-select-input',
  templateUrl: './mud-select-input.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudSelectInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSelectInput<T = unknown> implements ControlValueAccessor, FormValueControl<T | undefined> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudSelectInputVariant>('default');

  /** @description Size rung: medium (40px) or large (48px). */
  readonly size = input<MudSelectInputSize>('medium');

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Focusable and readable, but the listbox cannot open. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Whether the listbox is open. Two-way bindable. */
  readonly open = model(false);

  /** @description Selected value. Two-way bindable; also driven by both forms systems. */
  readonly value = model<T | undefined>(undefined);

  /** @description The selectable options. */
  readonly options = input<readonly MudSelectOption<T>[]>([]);

  readonly name = input<string>('');

  /** @description Shown in the trigger while nothing is selected. */
  readonly placeholder = input<string | undefined>(undefined);

  /** @description Shown inside the panel when `options` is empty. Localize per app. */
  readonly emptyText = input('No options');

  /**
   * @description Validation errors pushed by signal forms; the first message renders as
   * the error line unless `errorText` overrides it.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label above the field. */
  readonly label = input<string | undefined>(undefined);

  /** @description Helper/hint below the field. Replaced by the error message when invalid. */
  readonly helperText = input<string | undefined>(undefined);

  /** @description Error message shown below the field when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the trigger's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly _control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);
  protected readonly _projectedHelper = contentChild(MudInputHelper);
  protected readonly _projectedError = contentChild(MudInputError);

  protected readonly _id = `mud-select-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;
  protected readonly _listBoxId = `${this._id}-listbox`;

  protected readonly _focused = signal(false);
  protected readonly _highlighted = signal(-1);

  private _overlayRef: OverlayRef | null = null;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: T | undefined) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _effectiveVariant = computed<MudSelectInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _selectedOption = computed(() =>
    this.options().find((option) => Object.is(option.value, this.value())),
  );

  protected readonly _triggerText = computed(
    () => this._selectedOption()?.label ?? this.placeholder() ?? '',
  );

  protected readonly _isPlaceholder = computed(() => !this._selectedOption());

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    return this.errors().find((error) => error.message)?.message ?? undefined;
  });

  protected readonly _helperMessage = computed<string | undefined>(() => {
    const helper = this.helperText()?.trim();

    return helper || undefined;
  });

  /** @docs-private The error region shows while invalid with any content to show. */
  protected readonly _showError = computed(
    () => this._effectiveInvalid() && (!!this._projectedError() || !!this._errorMessage()),
  );

  /** @docs-private The helper region yields to an active error region. */
  protected readonly _showHelper = computed(
    () => !this._showError() && (!!this._projectedHelper() || !!this._helperMessage()),
  );

  protected readonly _showLabel = computed(() => !!this._projectedLabel() || !!this.label()?.trim());

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._showError()) ids.push(this._errorId);
    else if (this._showHelper()) ids.push(this._helperId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._showLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _activeDescendant = computed<string | null>(() =>
    this.open() && this._highlighted() >= 0 ? `${this._listBoxId}-opt-${this._highlighted()}` : null,
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'select-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this.open()) classes.push('is-open');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    // The overlay follows the open model (which is also settable from
    // outside), so attach/detach lives in one browser-only effect.
    effect(() => {
      if (!this._isBrowser) return;

      if (this.open()) this._attachPanel();
      else this._detachPanel();
    });

    inject(DestroyRef).onDestroy(() => this._detachPanel());
  }

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  writeValue(value: T | undefined): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | undefined) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // ----- FormValueControl extras -----

  /** Focuses the trigger (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._trigger().nativeElement.focus(options);
  }

  // ----- open/close -----

  protected _toggle(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (this.open()) this._close();
    else this._openPanel();
  }

  private _openPanel(): void {
    this._primeHighlight();
    this.open.set(true);
  }

  private _close(): void {
    this.open.set(false);
    this._highlighted.set(-1);
  }

  private _primeHighlight(): void {
    const options = this.options();
    const selected = options.findIndex(
      (option) => Object.is(option.value, this.value()) && !option.disabled,
    );

    this._highlighted.set(selected >= 0 ? selected : this._nextEnabled(-1, 1));
  }

  // ----- keyboard (trigger keeps focus; activedescendant drives the list) --

  protected _onTriggerKeydown(event: KeyboardEvent): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this._openPanel();
      }

      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._highlight(this._nextEnabled(this._highlighted(), 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._highlight(this._nextEnabled(this._highlighted(), -1));
        break;
      case 'Home':
        event.preventDefault();
        this._highlight(this._nextEnabled(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        this._highlight(this._nextEnabled(this.options().length, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();

        if (this._highlighted() >= 0) this._selectIndex(this._highlighted());

        break;
      case 'Escape':
        event.preventDefault();
        this._close();
        break;
      case 'Tab':
        // Close and let the tab proceed.
        this._close();
        break;
    }
  }

  /** Moves the highlight, keeping the option scrolled into view. */
  private _highlight(index: number): void {
    if (index < 0) return;

    this._highlighted.set(index);

    const panel = this._overlayRef?.overlayElement;
    const option = panel?.querySelector<HTMLElement>(`[data-option-index="${index}"]`);

    option?.scrollIntoView?.({ block: 'nearest' });
  }

  /** Clamping (non-wrapping) enabled-option walk, per the APG combobox pattern. */
  private _nextEnabled(from: number, direction: 1 | -1): number {
    const options = this.options();

    for (let i = from + direction; i >= 0 && i < options.length; i += direction) {
      if (!options[i].disabled) return i;
    }

    return from >= 0 && from < options.length ? from : -1;
  }

  protected _onOptionEnter(index: number): void {
    this._highlighted.set(index);
  }

  protected _selectIndex(index: number): void {
    const option = this.options()[index];

    if (!option || option.disabled) return;

    this.value.set(option.value);
    this._onChange(option.value);
    this._close();
    this.focus();
  }

  protected _onTriggerFocus(): void {
    this._focused.set(true);
  }

  protected _onTriggerBlur(): void {
    this._focused.set(false);
    this._onTouched();
    this.touch.emit();
  }

  // ----- overlay -----

  private _attachPanel(): void {
    if (this._overlayRef?.hasAttached()) return;

    const control = this._control().nativeElement;
    // Anchored to the field's bottom edge (flipping above only when below
    // can't fit) and NEVER pushed over the trigger; the panel is exactly as
    // wide as the field, like the official select.
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(control)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withPush(false)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      width: control.getBoundingClientRect().width,
    });

    this._overlayRef.attach(new TemplatePortal(this._panelTemplate(), this._viewContainerRef));

    // Long lists: bring the primed (selected) option into view immediately,
    // not only on the first keyboard move. The portal renders synchronously.
    if (this._highlighted() >= 0) this._highlight(this._highlighted());

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && !control.contains(target)) this._close();
    });
  }

  private _detachPanel(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }
}
