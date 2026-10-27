import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { FILE_GLYPH_SRC } from './file-glyph';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _mudText, injectMudFormatLocale, injectMudLabels } from 'ngx-mud-ui/i18n';
import { formatFileSize } from './format-file-size';
import { _MudFileInputStyles } from './mud-file-input-styles.component';

export type MudFileItemState = 'uploaded' | 'uploading' | 'success' | 'error';
export type MudFileItemVariant = 'default' | 'system';

let nextUniqueId = 0;

export interface MudFileItemRemove {
  filename: string;
}

/**
 * ```html
 * <mud-file-item filename="raport.pdf" [size]="245760" state="uploading" />
 * ```
 *
 * ```html
 * <mud-file-item filename="raport.pdf">
 *   <mud-icon icon name="file-pdf" />
 * </mud-file-item>
 * ```
 *
 * ```html
 * <mud-file-item variant="system" filename="certificat.pdf" [removable]="false">
 *   <span info>Emis <strong>12.03.2026</strong> · EVO</span>
 * </mud-file-item>
 * ```
 */
@Component({
  selector: 'mud-file-item',
  templateUrl: './mud-file-item.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudFileItem {
  /** @docs-private Per-instance gradient id, so a hidden row never breaks another row's glyph. */
  protected readonly _glyphFillId = `mud-file-item-glyph-${nextUniqueId++}`;

  /** @description Visible filename. Also suffixes the remove button's accessible label. */
  readonly filename = input.required<string>();

  /** @description File size in bytes, rendered human-readable (B / KB / MB / GB). */
  readonly size = input<number | undefined>(undefined);

  /** @description Lifecycle state: `uploaded`, `uploading` (spinner + cancel), `success` or `error`. */
  readonly state = input<MudFileItemState>('uploaded');

  /** @description `system` renders the issued-document card, with a projected `[info]` line under the name. */
  readonly variant = input<MudFileItemVariant>('default');

  /** @description Upload progress, 0–100. While `uploading`, a number shows a progress bar. */
  readonly progress = input<number | undefined>(undefined);

  /** @description Per-item error message, shown below the row only when `state` is `error`. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Thumbnail URL shown instead of the glyph; falls back to the glyph on load error. */
  readonly previewSrc = input<string | undefined>(undefined);

  /** @description Disables the remove button. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Set false to hide the remove button entirely (read-only summary lists). */
  readonly removable = input(true, { transform: booleanAttribute });

  /** @description Builds the remove button's accessible name from the filename. */
  readonly removeLabel = input<((filename: string) => string) | undefined>(undefined);

  /** @description Builds the button's accessible name from the filename while `uploading`, where it cancels. */
  readonly cancelLabel = input<((filename: string) => string) | undefined>(undefined);

  /** Fired when the remove (or cancel) button is pressed. */
  readonly removed = output<MudFileItemRemove>();

  private readonly _filenameEl = viewChild<ElementRef<HTMLElement>>('filenameEl');
  private readonly _removeEl = viewChild<ElementRef<HTMLButtonElement>>('removeEl');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Trusted constant; the sanitizer blocks `data:image/svg+xml` URLs otherwise. */
  protected readonly _glyphSrc = inject(DomSanitizer).bypassSecurityTrustUrl(FILE_GLYPH_SRC);

  /** @docs-private Cleared automatically when `previewSrc` changes to give the new image a chance. */
  protected readonly _previewFailed = linkedSignal(() => {
    this.previewSrc();

    return false;
  });

  /** @docs-private Gates the pure-CSS hover tooltip to actually-clipped filenames. */
  protected readonly _truncated = signal(false);

  protected readonly _showThumbnail = computed(() => !!this.previewSrc() && !this._previewFailed());

  /** @docs-private The error state drops the glyph so the red status icon carries the row alone. */
  protected readonly _showLeadingIcon = computed(() => this.state() !== 'error');

  protected readonly _showRemove = computed(() => this.removable() && this.state() !== 'success');

  private readonly _labels = injectMudLabels();
  private readonly _formatLocale = injectMudFormatLocale();

  protected readonly _removeAriaLabel = computed(() => {
    const text = this._labels().fileItem;
    const build =
      this.state() === 'uploading' ? _mudText(this.cancelLabel(), text.cancel) : _mudText(this.removeLabel(), text.remove);

    return build(this.filename());
  });

  protected readonly _isSystem = computed(() => this.variant() === 'system');

  /** @docs-private Clamped 0–100 while uploading with a finite progress, else null (no bar). */
  protected readonly _progress = computed(() => {
    const value = this.progress();

    if (this.state() !== 'uploading' || typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }

    return Math.min(100, Math.max(0, value));
  });

  protected readonly _progressNow = computed(() => {
    const value = this._progress();

    return value === null ? null : Math.round(value);
  });

  protected readonly _showErrorMessage = computed(
    () => this.state() === 'error' && !!this.errorText()?.trim(),
  );

  protected readonly _sizeText = computed(() => {
    const bytes = this.size();

    return bytes === undefined ? '' : formatFileSize(bytes, this._formatLocale(), this._labels().fileSize.units, 'item');
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['file-item', `file-item--${this.state()}`];

    if (this._isSystem()) classes.push('file-item--system');

    if (this.disabled()) classes.push('is-disabled');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudFileInputStyles);

    if (!this._isBrowser || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => this._measureTruncation());

    inject(DestroyRef).onDestroy(() => observer.disconnect());

    afterRenderEffect(() => {
      this.filename();
      const el = this._filenameEl()?.nativeElement;

      observer.disconnect();

      if (!el) return;

      observer.observe(el);
      this._measureTruncation();
    });
  }

  private _measureTruncation(): void {
    const el = this._filenameEl()?.nativeElement;

    if (!el) return;

    this._truncated.set(el.scrollWidth > el.clientWidth + 1);
  }

  /** @description Focuses this row's remove button; returns false if it can't. */
  focusRemove(): boolean {
    const button = this._removeEl()?.nativeElement;

    if (!this._isBrowser || !button || button.disabled) return false;

    button.focus();

    return true;
  }

  protected _onPreviewError(): void {
    this._previewFailed.set(true);
  }

  protected _onRemove(): void {
    if (this.disabled() || !this.removable()) return;

    this.removed.emit({ filename: this.filename() });
  }
}
