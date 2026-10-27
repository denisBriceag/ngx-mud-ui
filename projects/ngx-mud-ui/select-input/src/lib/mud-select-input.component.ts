import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

declare const ngDevMode: boolean | undefined;

import type { ElementRef, TemplateRef } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ViewContainerRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { foldForSearch, mudSelectDefaultFilter, toSelectRows } from './mud-select-options';
import type {
  MudSelectCompare,
  MudSelectFilter,
  MudSelectItem,
  MudSelectOption,
  MudSelectRowOption,
} from './mud-select-options';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import { _MudInputFieldStyles, _MudMenuPanelStyles, MudStyleLoader } from 'ngx-mud-ui/core';

export type MudSelectInputVariant = 'default' | 'destructive';
export type MudSelectInputSize = 'medium' | 'large';

let nextUniqueId = 0;

const TYPEAHEAD_RESET_MS = 500;

/** @docs-private Types the option row template's `let-entry` from the options it renders. */
@Directive({ selector: 'ng-template[mudSelectOptionRow]' })
export class MudSelectOptionRow<T> {
  readonly mudSelectOptionRow = input.required<readonly MudSelectItem<T>[]>();

  static ngTemplateContextGuard<T>(
    _dir: MudSelectOptionRow<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx: unknown,
  ): _ctx is { $implicit: MudSelectRowOption<T> } {
    return true;
  }
}

/**
 * ```html
 * <mud-select-input [formField]="form.raion" [options]="raions" required>
 *   <mud-label>Raion</mud-label>
 *   @if (form.raion().touched() && form.raion().invalid()) {
 *     <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
 *   }
 * </mud-select-input>
 * ```
 */
@Component({
  selector: 'mud-select-input',
  imports: [NgTemplateOutlet, MudSelectOptionRow],
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
export class MudSelectInput<T = unknown>
  implements ControlValueAccessor, FormValueControl<T | undefined>
{
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

  /** @description The selectable options; wrap some in `{ label, options }` groups for headed sections. */
  readonly options = input<readonly MudSelectItem<T>[]>([]);

  /** @description Decides whether an option's value equals the selected value; defaults to `Object.is`. */
  readonly compareWith = input<MudSelectCompare<T>>(Object.is);

  readonly name = input<string>('');

  /** @description Shown in the trigger while nothing is selected. */
  readonly placeholder = input<string | undefined>(undefined);

  /** @description Shown inside the panel when `options` is empty. Unset or blank follows the app labels (`selectInput.empty`). */
  readonly emptyText = input<string | undefined>(undefined);

  /** @description Renders a text field that filters the options as the user types. */
  readonly searchable = input(false, { transform: booleanAttribute });

  /** @description The search text typed into a searchable field. Two-way bindable. */
  readonly query = model('');

  /** @description Decides which options match `query`; `null` leaves filtering to the consumer. */
  readonly filterWith = input<MudSelectFilter<T> | null>(mudSelectDefaultFilter);

  /** @description Shown inside the panel when a query matches no option. Unset or blank follows the app labels (`selectInput.noResults`). */
  readonly noResultsText = input<string | undefined>(undefined);

  /** @description Shows a loading row instead of the options, e.g. while server results are fetched. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @description Shown inside the panel and announced while `loading`. Unset or blank follows the app labels (`selectInput.loading`). */
  readonly loadingText = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  protected readonly _optionsLabel = computed(() => this._labels().selectInput.options);

  protected readonly _emptyText = computed(() => _mudText(this.emptyText(), this._labels().selectInput.empty));

  protected readonly _noResultsText = computed(() => _mudText(this.noResultsText(), this._labels().selectInput.noResults));

  protected readonly _loadingText = computed(() => _mudText(this.loadingText(), this._labels().selectInput.loading));

  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the trigger's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _trigger =
    viewChild.required<ElementRef<HTMLButtonElement | HTMLInputElement>>('trigger');
  private readonly _control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-select-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
  protected readonly _listBoxId = `${this._id}-listbox`;

  protected readonly _focused = signal(false);
  private _overlayRef: OverlayRef | null = null;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: T | undefined) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudSelectInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  /** @docs-private Every option across groups, unfiltered. */
  private readonly _allOptions = computed(() => toSelectRows(this.options(), () => true).flat);

  /** @docs-private Which options the current query keeps visible. */
  private readonly _keep = computed<(option: MudSelectOption<T>) => boolean>(() => {
    const filter = this.filterWith();
    const query = this.query();

    if (!this.searchable() || filter === null || query.trim() === '') return () => true;

    return (option) => filter(option, query);
  });

  /** @docs-private Rows to render plus the flat list of visible options. */
  protected readonly _view = computed(() => toSelectRows(this.options(), this._keep()));

  protected readonly _highlighted = linkedSignal<{ flat: MudSelectOption<T>[] }, number>({
    source: this._view,
    computation: (view, previous) =>
      previous && untracked(this.searchable)
        ? view.flat.findIndex((option) => !option.disabled)
        : (previous?.value ?? -1),
  });

  protected readonly _selectedOption = computed(() =>
    this._allOptions().find((option) => this._matchesValue(option)),
  );

  // The last option seen matching the value, so server results that drop it still show its label.
  private readonly _remembered = linkedSignal<
    MudSelectOption<T> | undefined,
    MudSelectOption<T> | undefined
  >({
    source: this._selectedOption,
    computation: (selected, previous) => selected ?? previous?.value,
  });

  /** @docs-private The option whose label the field shows: the match, else (searchable) the remembered one. */
  protected readonly _displayOption = computed(() => {
    const remembered = this._remembered();
    const selected = this._selectedOption();

    if (selected || !this.searchable() || !remembered) return selected;

    const value = this.value();

    return this._sameValue(remembered.value, value) ? remembered : undefined;
  });

  protected readonly _triggerText = computed(
    () => this._displayOption()?.label ?? this.placeholder() ?? '',
  );

  protected readonly _isPlaceholder = computed(() => !this._displayOption());

  /** @docs-private Searchable field text: the query while open, else the selected label. */
  protected readonly _inputText = computed(() =>
    this.open() ? this.query() : (this._displayOption()?.label ?? ''),
  );

  /** @docs-private Searchable placeholder: the current choice while open. */
  protected readonly _inputPlaceholder = computed(
    () =>
      (this.open() ? (this._displayOption()?.label ?? this.placeholder()) : this.placeholder()) ??
      null,
  );

  /** @docs-private A non-empty query left no visible option. */
  protected readonly _noResults = computed(
    () => this.searchable() && this.query().trim() !== '' && this._view().flat.length === 0,
  );

  /** @docs-private Text for the polite live region: loading, then no results. */
  protected readonly _status = computed(() => {
    if (!this.open()) return '';

    if (this.loading()) return this._loadingText();

    return this._noResults() ? this._noResultsText() : '';
  });

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._hasLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _activeDescendant = computed<string | null>(() =>
    this.open() && !this.loading() && this._highlighted() >= 0
      ? `${this._listBoxId}-opt-${this._highlighted()}`
      : null,
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
    const styles = inject(MudStyleLoader);

    styles.load(_MudInputFieldStyles);
    styles.load(_MudMenuPanelStyles);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const value = this.value();
        const options = this._allOptions();

        if (value === undefined || value === null || options.length === 0) return;

        if (!this._displayOption()) {
          console.warn(
            `[mud-select-input] value ${JSON.stringify(value)} matches none of the ${options.length} options, ` +
              `so the trigger shows the placeholder as if nothing were selected. ` +
              `Add a matching option, or clear the value.`,
          );
        }
      });
    }

    // Searchable view changes (query, server results) keep the highlighted row in view; hover moves never scroll.
    afterRenderEffect(() => {
      if (!this.searchable() || !this.open()) return;

      this._view();
      this._scrollToOption(untracked(this._highlighted));
    });

    let wasOpen = untracked(this.open);

    effect(() => {
      const open = this.open();

      if (open === wasOpen) return;

      wasOpen = open;
      untracked(() => {
        if (!open) {
          this._highlighted.set(-1);

          if (this.searchable()) this.query.set('');
        } else if (this._highlighted() < 0) {
          this._primeHighlight();
        }
      });
    });

    afterRenderEffect(() => {
      if (!this.searchable() || this.open() || !this._inputText()) return;

      this._selectFieldText();
    });

    // The overlay follows the open model (which is also settable from
    // outside), so attach/detach lives in one browser-only effect.
    effect(() => {
      if (!this._isBrowser) return;

      if (this.open()) this._attachPanel();
      else this._detachPanel();
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this._typeaheadTimer);
      this._detachPanel();
    });
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

  protected _onAffixClick(): void {
    this.focus();

    if (this.searchable()) this._onSearchClick();
    else this._toggle();
  }

  protected _onChevronClick(): void {
    this.focus();
    this._toggle();
  }

  protected _toggle(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (this.open()) this._close();
    else this._openPanel();
  }

  private _openPanel(): void {
    if (this.searchable()) this.query.set('');

    this._primeHighlight();
    this.open.set(true);
  }

  private _close(): void {
    this.open.set(false);
    this._highlighted.set(-1);

    if (this.searchable()) this.query.set('');
  }

  private _matchesValue(option: MudSelectOption<T>): boolean {
    return this._sameValue(option.value, this.value());
  }

  private _sameValue(optionValue: T, value: T | undefined): boolean {
    return value === undefined || value === null
      ? Object.is(optionValue, value)
      : this.compareWith()(optionValue, value);
  }

  private _primeHighlight(): void {
    const options = this._view().flat;
    const selected = options.findIndex((option) => this._matchesValue(option) && !option.disabled);

    this._highlighted.set(selected >= 0 ? selected : this._nextEnabled(-1, 1));
  }

  // ----- keyboard (trigger keeps focus; activedescendant drives the list) --

  private _typeahead = '';
  private _typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  private _onTypeahead(event: KeyboardEvent): boolean {
    const { key } = event;

    if (key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false;

    if (key === ' ' && this._typeahead === '') return false;

    event.preventDefault();
    this._typeahead += key;
    clearTimeout(this._typeaheadTimer);
    this._typeaheadTimer = setTimeout(() => (this._typeahead = ''), TYPEAHEAD_RESET_MS);

    const query = foldForSearch(this._typeahead);
    const options = this._view().flat;
    const cycle = query.length > 1 && [...query].every((c) => c === query[0]);
    const prefix = cycle ? query[0] : query;
    const hit = (i: number) =>
      !options[i].disabled && foldForSearch(options[i].label).startsWith(prefix);
    const start = cycle ? this._highlighted() + 1 : 0;
    let found = -1;

    for (let n = 0; n < options.length; n++) {
      const i = (start + n) % options.length;

      if (hit(i)) {
        found = i;
        break;
      }
    }

    if (found < 0) return true;

    if (!this.open()) this._openPanel();

    this._highlight(found);

    return true;
  }

  protected _onTriggerKeydown(event: KeyboardEvent): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (this.searchable()) return this._onSearchKeydown(event);

    if (this._onTypeahead(event)) return;

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
        this._highlight(this._nextEnabled(this._view().flat.length, -1));
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

  private _onSearchKeydown(event: KeyboardEvent): void {
    const { key } = event;

    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this._openPanel();
      } else if (key.length === 1 && !event.metaKey && !(event.ctrlKey && !event.altKey)) {
        this._openForQuery();
      }

      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this._highlight(this._nextEnabled(this._highlighted(), 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._highlight(this._nextEnabled(this._highlighted(), -1));
        break;
      case 'Enter':
        event.preventDefault();

        if (this._highlighted() >= 0) this._selectIndex(this._highlighted());

        break;
      case 'Escape':
        event.preventDefault();
        this._close();
        break;
      case 'Tab':
        this._close();
        break;
    }
  }

  protected _onSearchInput(event: Event): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    this.query.set((event.target as HTMLInputElement).value);

    if (!this.open()) this.open.set(true);

    this._highlighted.set(this._nextEnabled(-1, 1));
  }

  protected _onSearchPaste(): void {
    if (this._effectiveDisabled() || this.readonly() || this.open()) return;

    this._openForQuery();
  }

  private _openForQuery(): void {
    this._trigger().nativeElement.value = '';
    this._openPanel();
  }

  protected _onSearchClick(): void {
    if (this._effectiveDisabled() || this.readonly() || this.open()) return;

    this._openPanel();
  }

  /** Moves the highlight, keeping the option scrolled into view; not while loading hides the options. */
  private _highlight(index: number): void {
    if (index < 0 || this.loading()) return;

    this._highlighted.set(index);
    this._scrollToOption(index);
  }

  private _scrollToOption(index: number): void {
    if (index < 0) return;

    const panel = this._overlayRef?.overlayElement;
    const option = panel?.querySelector<HTMLElement>(`[data-option-index="${index}"]`);

    option?.scrollIntoView?.({ block: 'nearest' });
  }

  private _selectFieldText(): void {
    const field = this._trigger().nativeElement;

    if (field instanceof HTMLInputElement && field.ownerDocument.activeElement === field) {
      field.select();
    }
  }

  /** Clamping (non-wrapping) enabled-option walk, per the APG combobox pattern. */
  private _nextEnabled(from: number, direction: 1 | -1): number {
    const options = this._view().flat;

    for (let i = from + direction; i >= 0 && i < options.length; i += direction) {
      if (!options[i].disabled) return i;
    }

    return from >= 0 && from < options.length ? from : -1;
  }

  private _pointer: { x: number; y: number } | null = null;

  protected _onOptionPointerMove(index: number, event: MouseEvent): void {
    const { screenX: x, screenY: y } = event;

    if (this._pointer?.x === x && this._pointer.y === y) return;

    this._pointer = { x, y };

    if (this._highlighted() !== index) this._highlighted.set(index);
  }

  protected _selectIndex(index: number): void {
    const option = this._view().flat[index];

    // While loading the options are hidden, so none can be picked.
    if (!option || option.disabled || this.loading()) return;

    this._remembered.set(option);
    this.value.set(option.value);
    this._onChange(option.value);
    this._close();
    this.focus();
  }

  protected _onTriggerFocus(): void {
    this._focused.set(true);

    if (this.searchable() && !this.open() && this._isBrowser) this._selectFieldText();
  }

  protected _onTriggerBlur(): void {
    this._focused.set(false);

    if (this.searchable() && this.open()) this._close();

    this._onTouched();
    this.touch.emit();
  }

  // ----- overlay -----

  private _attachPanel(): void {
    if (this._overlayRef?.hasAttached()) return;

    const control = this._control().nativeElement;
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
