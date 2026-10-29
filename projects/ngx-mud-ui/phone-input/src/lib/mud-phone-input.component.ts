import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
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
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { injectMudFormatLocale, injectMudLabels, _mudText, _safeLocale } from 'ngx-mud-ui/i18n';
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
import { _MudInputFieldStyles, _MudMenuPanelStyles, MudStyleLoader } from 'ngx-mud-ui/core';

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
 * ```html
 * <mud-phone-input [formField]="form.phone" required>
 *   <mud-label>Telefon</mud-label>
 *   @if (form.phone().touched() && form.phone().invalid()) {
 *     <mud-inline-message variant="error">Număr invalid.</mud-inline-message>
 *   }
 * </mud-phone-input>
 * ```
 */
@Component({
  selector: 'mud-phone-input',
  templateUrl: './mud-phone-input.component.html',
  styleUrl: './mud-phone-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
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

  /** @description Selected country (ISO 3166-1 alpha-2); follows the dial code of a written E.164. */
  readonly country = model<string>(MUD_PHONE_DEFAULT_ISO);

  /** @description `local` shows a fixed dial-code prefix; `international` adds a searchable country list. */
  readonly mode = input<MudPhoneInputMode>('local');

  /** @description Countries offered in `international` mode, in order: built-in ISO codes or `MudPhoneCountry` objects. */
  readonly countries = input<readonly (string | MudPhoneCountry)[] | undefined>(undefined);

  /** @description BCP 47 locale for country names (via `Intl.DisplayNames`). Defaults to the format locale. */
  readonly locale = input<string | undefined>(undefined);

  /** @description Size rung: medium (40px) or large (48px). */
  readonly size = input<MudPhoneInputSize>('medium');

  /** @description Colour treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudPhoneInputVariant>('default');

  /** @description Disables the field. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });
  /** @description Read-only: the number stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Shows a spinner and blocks editing, e.g. while the number is fetched. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Shows a trailing clear button while the field holds digits. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @description Native `name` attribute. */
  readonly name = input<string>('');

  /** @description Placeholder for the national segment. Defaults to the country's mask. */
  readonly placeholder = input<string | undefined>(undefined);

  /** @description Accessible label of the clear button. Unset or blank follows the app labels (`phoneInput.clear`). */
  readonly clearLabel = input<string | undefined>(undefined);

  /** @description Accessible name of the country trigger from the country name and dial code, e.g. `(n, d) => d + ' ' + n`. */
  readonly countryLabel = input<((name: string, dialCode: string) => string) | undefined>(undefined);

  /** @description Accessible name of the country list. Unset or blank follows the app labels (`phoneInput.countryList`). */
  readonly countryListLabel = input<string | undefined>(undefined);

  /** @description Placeholder and accessible name of the country search field. Unset or blank follows the app labels (`phoneInput.countrySearch`). */
  readonly countrySearchLabel = input<string | undefined>(undefined);

  /** @description Shown in the country list when the search matches nothing. Unset or blank follows the app labels (`phoneInput.countryEmpty`). */
  readonly countryEmptyText = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  protected readonly _clearLabel = computed(() => _mudText(this.clearLabel(), this._labels().phoneInput.clear));

  protected readonly _countryLabelFn = computed(() => _mudText(this.countryLabel(), this._labels().phoneInput.country));

  protected readonly _countryListLabel = computed(() => _mudText(this.countryListLabel(), this._labels().phoneInput.countryList));

  protected readonly _countrySearchLabel = computed(() => _mudText(this.countrySearchLabel(), this._labels().phoneInput.countrySearch));

  protected readonly _countryEmptyText = computed(() => _mudText(this.countryEmptyText(), this._labels().phoneInput.countryEmpty));

  /** @docs-private Accessible name of the country trigger, from the label function. */
  protected readonly _triggerLabel = computed(() => {
    const country = this._country();

    return this._countryLabelFn()(this._countryName(country), country.dialCode);
  });

  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when the value is committed (on blur), with the number, the country and whether it's complete. */
  readonly changed = output<MudPhoneInputChange>();

  /** @description Fires when focus leaves the field; signal forms use it to mark the field touched. */
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
  private readonly _formatLocale = injectMudFormatLocale();

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-phone-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
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

  /** @docs-private Masked national segment, a pure derivation of value + country (no sync state). */
  protected readonly _display = computed(() =>
    applyMask(nationalOf(this.value(), this._country()), this._country()),
  );

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudPhoneInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  /** Trusted-URL cache keyed on the flag itself, not the ISO: a supplied entry may override a built-in flag. */
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
  protected readonly _activeLocale = computed(() => _safeLocale(this.locale(), this._formatLocale()));

  /** `Intl.DisplayNames` is not cheap to construct; one per locale is plenty. */
  private readonly _displayNamesCache = new Map<string, Intl.DisplayNames | null>();

  /** Resolved names by locale + ISO + fallback; `of()` is not free and runs per row per CD pass. */
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

  /** @docs-private Country name in the active locale, else the entry's own `name`. */
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

  /** Pure: returns diagnostics instead of logging; an effect below warns. */
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

  /** @docs-private Disabled, read-only or loading: nothing the user does may change the value or open the list. */
  protected readonly _locked = computed(
    () => this._effectiveDisabled() || this.readonly() || this.loading(),
  );

  protected readonly _showClear = computed(
    () => this.clearable() && !this._locked() && this._display().length > 0,
  );

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() =>
    this._hasLabel() ? null : (this.ariaLabel() ?? null),
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'phone-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this.loading()) classes.push('is-loading');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    if (this._open()) classes.push('is-open');

    return classes.join(' ');
  });

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudInputFieldStyles);
    styles.load(_MudMenuPanelStyles);

    // Becoming disabled, read-only or loading closes an open country list.
    effect(() => {
      if (this._locked() && untracked(this._open)) {
        untracked(() => this._closeList({ restoreFocus: false }));
      }
    });

    effect(() => {
      const display = this._display();

      if (!this._isBrowser) return;

      const native = this._native().nativeElement;

      if (native.value !== display) native.value = display;
    });

    // Writes only on a real change: Chrome moves the caret to the end even when the value is unchanged.
    effect(() => {
      const query = this._query();
      const search = this._searchEl()?.nativeElement;

      if (search && search.value !== query) search.value = query;
    });

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        for (const problem of this._resolvedCountries().problems) {
          console.warn(`[mud-phone-input] ${problem}`);
        }
      });
    }

    // Unknown ISO warns but must not break rendering; `_country()` falls back to Moldova.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const requested = this.country();
        const resolved = this._country().iso;
        const known = requested?.toUpperCase() === resolved.toUpperCase();

        if (requested && !known) {
          console.warn(
            `[mud-phone-input] country="${requested}" is not among the offered countries. Using "${resolved}".`,
          );
        }
      });
    }

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
    if (this._locked()) return;

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
    if (this._locked()) return;

    this._publish('');
    this._native().nativeElement.value = '';
    this.focus();
  }

  protected _toggleList(): void {
    if (this._locked()) return;

    if (this._open()) this._closeList();
    else this._openList();
  }

  private _openList(): void {
    if (this._locked() || this._open()) return;

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
    // The reconciliation effect keeps the digits and swaps the dial code.
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
