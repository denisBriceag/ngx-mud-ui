import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  LOCALE_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ElementRef, TemplateRef } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Overlay } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeUrl } from '@angular/platform-browser';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';
import {
  MUD_PHONE_COUNTRIES,
  MUD_PHONE_DEFAULT_ISO,
  findCountry,
  findCountryByDialCode,
  validateCountry,
} from './phone-countries';
import type { MudPhoneCountry } from './phone-countries';
import { MUD_PHONE_FLAGS } from './phone-flags';
import { MUD_PHONE_COUNTRIES_CONFIG } from './provide-mud-phone-countries';
import { applyMask, caretForDigitIndex, digitsBefore, digitsOf, isComplete, nationalOf, toE164 } from './phone-mask';

declare const ngDevMode: boolean | undefined;

export type MudPhoneInputSize = 'medium' | 'large';
export type MudPhoneInputVariant = 'default' | 'warning' | 'destructive' | 'success';

export type MudPhoneInputMode = 'local' | 'international';

export interface MudPhoneInputChange {
  /** Canonical E.164, or the empty string when no digits were entered. */
  value: string;
  /** ISO 3166-1 alpha-2 of the country the number was entered against. */
  country: string;
  /** Whether the national digit count sits inside the country's window. */
  complete: boolean;
}

let nextUniqueId = 0;

/**
 * Phone entry with a country dial-code prefix and a per-country format mask.
 * The form value is canonical E.164 (`+37362123456`); the masked national
 * segment is only ever a rendering of it.
 *
 * ```html
 * <mud-phone-input label="Telefon" [formControl]="phone" required />
 * ```
 */
@Component({
  selector: 'mud-phone-input',
  templateUrl: './mud-phone-input.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudPhoneInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudPhoneInput implements ControlValueAccessor, FormValueControl<string> {
  /** @description Canonical E.164 (`+37362123456`). */
  readonly value = model<string>('');

  /**
   * @description Selected country as ISO 3166-1 alpha-2. Two-way: writing an E.164 whose
   * dial code belongs to another country moves it. Unknown codes warn in dev
   * and fall back to Moldova.
   */
  readonly country = model<string>(MUD_PHONE_DEFAULT_ISO);

  /**
   * @description `local` (default) fixes the country to `country` and renders its prefix
   * as inert text. `international` renders a combobox that opens a searchable
   * country list.
   */
  readonly mode = input<MudPhoneInputMode>('local');

  /**
   * @description The countries to offer in `international` mode, in this order. Defaults
   * to the full curated list.
   *
   * Entries are either an ISO code from the built-in table (`'RO'`) or a whole
   * `MudPhoneCountry` object, which is how you add a country the table does not
   * carry. Unknown ISO codes and malformed objects warn in development.
   */
  readonly countries = input<readonly (string | MudPhoneCountry)[] | undefined>(undefined);

  /**
   * @description BCP 47 locale the country names are rendered in. Defaults to the app's
   * `LOCALE_ID`. Names come from `Intl.DisplayNames`, so no per-language data
   * ships with the component.
   */
  readonly locale = input<string | undefined>(undefined);

  /** @description Size rung: medium (40px) or large (48px). */
  readonly size = input<MudPhoneInputSize>('medium');

  /** @description Colour treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudPhoneInputVariant>('default');

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Shows a trailing clear button while the field holds digits. */
  readonly clearable = input(false, { transform: booleanAttribute });

  readonly name = input<string>('');

  /** @description Plain-text label. Use the `[mudLabel]` slot for richer content. */
  readonly label = input<string | undefined>(undefined);

  /** @description Helper/hint below the field. Replaced by the error message when invalid. */
  readonly helperText = input<string | undefined>(undefined);

  /** @description Error message shown below the field when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /**
   * @description Validation errors pushed by signal forms; the first message renders as
   * the error line unless `errorText` overrides it.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Placeholder for the national segment. Defaults to the country's mask. */
  readonly placeholder = input<string | undefined>(undefined);

  /** @description Accessible label of the clear button. Localize per app. */
  readonly clearLabel = input('Clear');

  /** @description Accessible name of the country combobox. Localize per app. */
  readonly countryLabel = input('Country');

  /** @description Placeholder and accessible name of the country search field. Localize per app. */
  readonly countrySearchLabel = input('Search country');

  /** @description Shown in the country list when the search matches nothing. Localize per app. */
  readonly countryEmptyText = input('No countries found');

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Fired when the value is committed (blur), carrying the digit-window check. */
  readonly changed = output<MudPhoneInputChange>();

  /** Signal-forms touch contract: emitted when the field loses focus. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly _trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly _searchEl = viewChild<ElementRef<HTMLInputElement>>('searchEl');
  private readonly _panelTemplate = viewChild<TemplateRef<unknown>>('panel');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  /** App-wide list from `provideMudPhoneCountries`; the input outranks it. */
  private readonly _configuredCountries = inject(MUD_PHONE_COUNTRIES_CONFIG, { optional: true });
  private readonly _appLocale = inject(LOCALE_ID);

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);
  protected readonly _projectedHelper = contentChild(MudInputHelper);
  protected readonly _projectedError = contentChild(MudInputError);

  protected readonly _id = `mud-phone-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;
  protected readonly _listBoxId = `${this._id}-listbox`;
  protected readonly _triggerId = `${this._id}-country`;

  protected readonly _focused = signal(false);

  /** @docs-private Country-list state (international mode only). */
  protected readonly _open = signal(false);
  protected readonly _query = signal('');
  protected readonly _highlighted = signal(-1);

  private _overlayRef: OverlayRef | null = null;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** Last E.164 this component itself wrote — anything else is an external write. */
  private _selfPublished: string | null = null;
  /** ISO the previous reconciliation saw, to detect an actual country change. */
  private _previousIso: string | undefined = undefined;
  /** A country this component moved by inference; its rebuild must be skipped. */
  private _skipRebuildFor: string | null = null;

  /** @docs-private Resolved country, always a real entry — never undefined. */
  protected readonly _country = computed<MudPhoneCountry>(() => {
    const iso = this.country()?.toUpperCase();
    const offered = this._countryList();

    return (
      offered.find((entry) => entry.iso.toUpperCase() === iso) ??
      offered[0] ??
      findCountry(MUD_PHONE_DEFAULT_ISO)!
    );
  });

  /**
   * @docs-private The masked national segment is a PURE derivation of the value and
   * country — no separate display state, so there is no sync effect to get
   * wrong (contrast the numeric-input display bridge).
   */
  protected readonly _display = computed(() =>
    applyMask(nationalOf(this.value(), this._country()), this._country()),
  );

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _effectiveVariant = computed<MudPhoneInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  /**
   * Trusted-URL cache: bypassing per render would allocate on every CD pass.
   * Keyed on the flag ITSELF, not the ISO - a supplied entry may override a
   * built-in country's flag, and an ISO key would keep serving the old one.
   */
  private readonly _flagCache = new Map<string, SafeUrl>();

  /** @docs-private Flag for any country row; memoized per ISO. */
  protected _flagFor(country: MudPhoneCountry): SafeUrl | null {
    const flag = country.flag ?? MUD_PHONE_FLAGS[country.iso];

    if (!flag) return null;

    const cached = this._flagCache.get(flag);

    if (cached) return cached;

    const trusted = this._sanitizer.bypassSecurityTrustUrl(flag);

    this._flagCache.set(flag, trusted);

    return trusted;
  }

  protected readonly _flagSrc = computed<SafeUrl | null>(() => this._flagFor(this._country()));

  /** @docs-private The offered countries, narrowed and ordered by `countries`. */
  protected readonly _activeLocale = computed(() => this.locale() ?? this._appLocale);

  /** `Intl.DisplayNames` is not cheap to construct; one per locale is plenty. */
  private readonly _displayNamesCache = new Map<string, Intl.DisplayNames | null>();

  /**
   * Resolved names, keyed by locale + ISO + fallback. `_countryName` is called
   * once per row per change-detection pass and once per row per search
   * keystroke, and `of()` is not free.
   */
  private readonly _countryNameCache = new Map<string, string>();

  private _displayNames(locale: string): Intl.DisplayNames | null {
    if (this._displayNamesCache.has(locale)) return this._displayNamesCache.get(locale)!;

    let instance: Intl.DisplayNames | null = null;

    try {
      if (typeof Intl?.DisplayNames === 'function') {
        instance = new Intl.DisplayNames([locale], { type: 'region' });
      }
    } catch {
      instance = null;
    }

    this._displayNamesCache.set(locale, instance);

    return instance;
  }

  /**
   * @docs-private The displayed country name, derived from the ISO code in the active
   * locale. `of()` echoes the code back when it has no data, which is not a
   * usable label, so that falls through to the entry's own `name`.
   */
  protected _countryName(country: MudPhoneCountry): string {
    const locale = this._activeLocale();
    const key = `${locale}|${country.iso}|${country.name}`;
    const cached = this._countryNameCache.get(key);

    if (cached !== undefined) return cached;

    const localized = this._displayNames(locale)?.of(country.iso);
    // `of()` echoes the code back when it has no data, which is not a label.
    const resolved =
      localized && localized.toUpperCase() !== country.iso.toUpperCase() ? localized : country.name;

    this._countryNameCache.set(key, resolved);

    return resolved;
  }

  /**
   * Resolution kept PURE - it returns the diagnostics rather than logging them,
   * so the computed has no side effects. An effect below does the warning.
   */
  private readonly _resolvedCountries = computed<{
    readonly list: readonly MudPhoneCountry[];
    readonly problems: readonly string[];
  }>(() => {
    const requested = this.countries() ?? this._configuredCountries;

    if (!requested) return { list: MUD_PHONE_COUNTRIES, problems: [] };

    const list: MudPhoneCountry[] = [];
    const problems: string[] = [];

    for (const entry of requested) {
      if (typeof entry !== 'string') {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          const issues = validateCountry(entry);

          if (issues.length > 0) {
            problems.push(
              `country "${entry.iso}" supplied via [countries] looks wrong: ${issues.join('; ')}.`,
            );
          }
        }

        list.push(entry);
        continue;
      }

      const known = findCountry(entry);

      if (known) {
        list.push(known);
        continue;
      }

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        problems.push(
          `[countries] entry "${entry}" is not in the built-in table and was skipped. ` +
            `Pass a full MudPhoneCountry object to add a country the table does not carry.`,
        );
      }
    }

    return { list, problems };
  });

  protected readonly _countryList = computed<readonly MudPhoneCountry[]>(
    () => this._resolvedCountries().list,
  );

  /** @docs-private Search matches English name, Romanian name, ISO or dial code. */
  protected readonly _filtered = computed<readonly MudPhoneCountry[]>(() => {
    const query = this._query().trim().toLowerCase();

    if (!query) return this._countryList();

    const digits = query.replace(/\D/g, '');

    return this._countryList().filter((country) => {
      const haystack = [this._countryName(country), country.name, ...(country.aliases ?? [])];

      return (
        haystack.some((term) => term.toLowerCase().includes(query)) ||
        country.iso.toLowerCase() === query ||
        (!!digits && country.dialCode.replace(/\D/g, '').startsWith(digits))
      );
    });
  });

  protected readonly _activeDescendant = computed<string | null>(() => {
    const index = this._highlighted();

    return index >= 0 && index < this._filtered().length ? `${this._listBoxId}-opt-${index}` : null;
  });

  protected readonly _isInternational = computed(() => this.mode() === 'international');

  protected readonly _showClear = computed(
    () =>
      this.clearable() &&
      !this._effectiveDisabled() &&
      !this.readonly() &&
      this._display().length > 0,
  );

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    return this.errors().find((error) => error.message)?.message ?? undefined;
  });

  protected readonly _helperMessage = computed(() => this.helperText()?.trim() || undefined);

  protected readonly _showError = computed(
    () => this._effectiveInvalid() && (!!this._projectedError() || !!this._errorMessage()),
  );

  protected readonly _showHelper = computed(
    () => !this._showError() && (!!this._projectedHelper() || !!this._helperMessage()),
  );

  protected readonly _showLabel = computed(
    () => !!this._projectedLabel() || !!this.label()?.trim(),
  );

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._showError()) ids.push(this._errorId);
    else if (this._showHelper()) ids.push(this._helperId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() =>
    this._showLabel() ? null : (this.ariaLabel() ?? null),
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'phone-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      const display = this._display();

      if (!this._isBrowser) return;

      const native = this._native().nativeElement;

      if (native.value !== display) native.value = display;
    });

    effect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

      for (const problem of this._resolvedCountries().problems) {
        console.warn(`[mud-phone-input] ${problem}`);
      }
    });

    // An unknown ISO is a consumer bug worth surfacing, but must not break
    // rendering — `_country()` already falls back to Moldova.
    effect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

      const requested = this.country();
      const resolved = this._country().iso;
      const known = requested?.toUpperCase() === resolved.toUpperCase();

      if (requested && !known) {
        console.warn(
          `[mud-phone-input] country="${requested}" is not among the offered countries. Using "${resolved}".`,
        );
      }
    });

    effect(() => {
      const requested = this.country();
      const resolved = this._country().iso;

      if (requested?.toUpperCase() !== resolved.toUpperCase()) {
        this.country.set(resolved);
      }
    });

    effect(() => {
      const value = this.value();

      if (value === this._selfPublished) return;

      this._selfPublished = value;

      const inferred = findCountryByDialCode(value, untracked(() => this._countryList()));

      if (!inferred || inferred.iso === untracked(() => this._country().iso)) return;

      this._skipRebuildFor = inferred.iso;
      this.country.set(inferred.iso);
    });

    effect(() => {
      const iso = this.country();
      const previous = this._previousIso;

      this._previousIso = iso;

      if (previous === undefined || previous === iso) return;

      if (this._skipRebuildFor === iso) {
        this._skipRebuildFor = null;

        return;
      }

      untracked(() => {
        const from = findCountry(previous);
        const national = from ? nationalOf(this.value(), from) : digitsOf(this.value());

        if (!national) return;

        this._publish(national);
      });
    });
  }

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  /** @description Focuses the national-segment input (also used by signal forms). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  private _publish(nationalDigits: string): void {
    const next = toE164(nationalDigits, this._country());

    this._selfPublished = next;
    this.value.set(next);
    this._onChange(next);
  }

  protected _onInput(event: Event): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    const native = event.target as HTMLInputElement;
    const raw = native.value;
    const caret = native.selectionStart ?? raw.length;
    const digitIndex = digitsBefore(raw, caret);
    const masked = applyMask(raw, this._country());

    this._publish(digitsOf(masked));

    native.value = masked;

    if (this._isBrowser) {
      const next = caretForDigitIndex(masked, digitIndex);

      native.setSelectionRange(next, next);
    }
  }

  protected _onBlur(): void {
    this._focused.set(false);
    this._onTouched();
    this.touch.emit();

    const national = nationalOf(this.value(), this._country());

    this.changed.emit({
      value: this.value(),
      country: this._country().iso,
      complete: isComplete(national, this._country()),
    });
  }

  protected _onFocus(): void {
    this._focused.set(true);
  }

  protected _onClear(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    this._publish('');
    this._native().nativeElement.value = '';
    this.focus();
  }

  protected _toggleList(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (this._open()) this._closeList();
    else this._openList();
  }

  private _openList(): void {
    if (this._effectiveDisabled() || this.readonly() || this._open()) return;

    // Every open starts from a clean search, priming the current country.
    this._query.set('');
    this._highlighted.set(
      this._filtered().findIndex((country) => country.iso === this._country().iso),
    );
    this._open.set(true);
    this._attachPanel();

    this._highlight(this._highlighted());

    if (this._isBrowser) this._searchEl()?.nativeElement.focus();
  }

  private _closeList(options?: { restoreFocus?: boolean }): void {
    if (!this._open()) return;

    this._open.set(false);
    this._query.set('');
    this._highlighted.set(-1);
    this._detachPanel();

    if (this._isBrowser && options?.restoreFocus !== false) {
      this._trigger()?.nativeElement.focus();
    }
  }

  protected _onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._openList();
    }
  }

  private _highlight(index: number): void {
    this._highlighted.set(index);

    if (!this._isBrowser || index < 0) return;

    const panel = this._overlayRef?.overlayElement;
    const option = panel?.querySelector<HTMLElement>(`[data-option-index="${index}"]`);

    option?.scrollIntoView?.({ block: 'nearest' });
  }

  protected _onSearchInput(event: Event): void {
    this._query.set((event.target as HTMLInputElement).value);

    this._highlighted.set(-1);
  }

  protected _onListKeydown(event: KeyboardEvent): void {
    const count = this._filtered().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();

        if (count > 0) this._highlight(Math.min(this._highlighted() + 1, count - 1));

        return;
      case 'ArrowUp':
        event.preventDefault();

        if (count > 0) this._highlight(Math.max(this._highlighted() - 1, 0));

        return;
      case 'Home':
        event.preventDefault();

        if (count > 0) this._highlight(0);

        return;
      case 'End':
        event.preventDefault();

        if (count > 0) this._highlight(count - 1);

        return;
      case 'Enter': {
        event.preventDefault();
        const active = this._filtered()[this._highlighted()];

        if (active) this._selectCountry(active);

        return;
      }
      case 'Escape':
        event.preventDefault();
        this._closeList();

        return;
      case 'Tab':
        // Let focus leave naturally, but do not leave an orphaned panel behind.
        this._closeList({ restoreFocus: false });
    }
  }

  protected _selectCountry(country: MudPhoneCountry): void {
    // Setting the model runs the reconciliation effect, which keeps the digits
    // and swaps the dial code.
    this.country.set(country.iso);
    this._closeList();
  }

  protected _onOptionEnter(index: number): void {
    this._highlighted.set(index);
  }

  private _attachPanel(): void {
    const template = this._panelTemplate();

    if (!this._isBrowser || !template || this._overlayRef?.hasAttached()) return;

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

    this._overlayRef.attach(new TemplatePortal(template, this._viewContainerRef));

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && !control.contains(target)) this._closeList({ restoreFocus: false });
    });
  }

  private _detachPanel(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }
}
