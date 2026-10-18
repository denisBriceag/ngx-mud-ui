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
import { _MudFileInputStyles } from './mud-file-input-styles.component';

export type MudFileItemState = 'uploaded' | 'uploading' | 'success' | 'error';

export interface MudFileItemRemove {
  filename: string;
}

/**
 * Single-file row inside `mud-file-input`, or standalone in any file list
 * (consumer-driven upload progress, read-only summaries).
 *
 * ```html
 * <mud-file-item filename="raport.pdf" [size]="245760" state="uploading" />
 * ```
 *
 * Project an `[icon]` to replace the leading file glyph — a per-extension icon,
 * or an `<img ngSrc>` when the preview comes from a server (`previewSrc` mints
 * object URLs, which `NgOptimizedImage` rejects):
 *
 * ```html
 * <mud-file-item filename="raport.pdf">
 *   <mud-icon icon name="file-pdf" />
 * </mud-file-item>
 * ```
 *
 * A `previewSrc` thumbnail still wins over the projected icon, and the `error`
 * state drops the leading icon entirely so the status icon carries the row.
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
  /** @description Visible filename. Also suffixes the remove button's accessible label. */
  readonly filename = input.required<string>();

  /** @description File size in bytes, rendered human-readable (B / KB / MB / GB). */
  readonly size = input<number | undefined>(undefined);

  /**
   * @description Lifecycle state. `uploaded` (resting) and `error` rows are removable;
   * `uploading` shows a spinner and `success` a confirmation tick instead.
   */
  readonly state = input<MudFileItemState>('uploaded');

  /** @description Per-item error message, shown below the row only when `state` is `error`. */
  readonly errorText = input<string | undefined>(undefined);

  /**
   * @description Image-preview URL (object URL or data URI) rendered as a thumbnail in
   * place of the file glyph. Falls back to the glyph if the image fails to load.
   */
  readonly previewSrc = input<string | undefined>(undefined);

  /** @description Disables the remove button. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Set false to hide the remove button entirely (read-only summary lists). */
  readonly removable = input(true, { transform: booleanAttribute });

  /** @description Accessible-label prefix of the remove button; the filename is appended. Localize per app. */
  readonly removeLabel = input('Remove file');

  /** Fired when the remove button is pressed. The owner splices the file out of its list. */
  readonly removed = output<MudFileItemRemove>();

  private readonly _filenameEl = viewChild<ElementRef<HTMLElement>>('filenameEl');
  private readonly _removeEl = viewChild<ElementRef<HTMLButtonElement>>('removeEl');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * @docs-private The glyph is our own constant; the bypass only exempts it from the
   * sanitizer's data-URI blocklist (`data:image/svg+xml` is not on Angular's
   * allowed image list), no untrusted value flows in.
   */
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

  protected readonly _showRemove = computed(
    () => this.removable() && (this.state() === 'uploaded' || this.state() === 'error'),
  );

  protected readonly _showErrorMessage = computed(
    () => this.state() === 'error' && !!this.errorText()?.trim(),
  );

  protected readonly _sizeText = computed(() => {
    const bytes = this.size();

    if (bytes === undefined) return '';

    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['file-item', `file-item--${this.state()}`];

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

  /**
   * @description Focuses this row's remove button. The owning list calls it after a
   * removal so focus never falls back to the document body.
   */
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
