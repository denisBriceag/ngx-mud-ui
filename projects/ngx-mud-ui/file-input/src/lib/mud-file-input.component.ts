import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudButton } from 'ngx-mud-ui/button';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudFileItem } from './mud-file-item.component';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudFileInputStyles } from './mud-file-input-styles.component';

export type MudFileInputVariant = 'dropzone' | 'button';
export type MudFileInputSize = 'medium' | 'large';
export type MudFileInputRejectionCode = 'type' | 'size' | 'count';

export interface MudFileInputRejection {
  code: MudFileInputRejectionCode;
  file: File;
}

export interface MudFileInputRemove {
  file: File;
  index: number;
  files: readonly File[];
}

/** Best-effort MIME / extension -> short extension list: `image/jpeg,.pdf` → `jpg, pdf`. */
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'text/csv': 'csv',
};

let nextUniqueId = 0;

/**
 * Drag-and-drop / click-to-browse file selection. Owns selection, validation
 * and display; the actual upload (progress, retries) is consumer-driven from
 * the `value` — render your own `mud-file-item` rows with per-file `state`
 * and turn `showFileList` off when you do.
 *
 * ```html
 * <mud-file-input [formField]="form.documents" accept=".pdf,image/*" multiple [maxSize]="5242880">
 *   <mud-label>Documente</mud-label>
 *   @if (form.documents().touched() && form.documents().invalid()) {
 *     <mud-inline-message variant="error">Încărcați cel puțin un document.</mud-inline-message>
 *   }
 * </mud-file-input>
 * ```
 */
@Component({
  selector: 'mud-file-input',
  templateUrl: './mud-file-input.component.html',
  imports: [MudButton, MudFileItem],
  host: {
    '[class]': '_hostClasses()',
    '(focusout)': '_onFocusout($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudFileInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudFileInput implements ControlValueAccessor, FormValueControl<File[]> {
  /** @description `dropzone` shows the dashed drag-and-drop area; `button` a plain upload button. */
  readonly variant = input<MudFileInputVariant>('dropzone');

  /** @description Visual size rung. Drives drop-zone height and button scale. */
  readonly size = input<MudFileInputSize>('medium');

  /** @description Accepted files — the form value. Two-way bindable; driven by both forms systems. */
  readonly value = model<File[]>([]);

  /** @description Native `accept` filter — MIME types and/or extensions, comma-separated. */
  readonly accept = input<string | undefined>(undefined);

  /** @description Allow selecting more than one file. Off, a new selection replaces the value. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** @description Maximum number of files kept when `multiple`; the rest reject with code `count`. */
  readonly maxFiles = input<number | undefined>(undefined);

  /** @description Maximum per-file size in bytes; larger files reject with code `size`. */
  readonly maxSize = input<number | undefined>(undefined);

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * @description Set false to suppress the built-in file list — for consumers that render
   * their own `mud-file-item` rows with per-file upload state.
   */
  readonly showFileList = input(true, { transform: booleanAttribute });

  readonly name = input<string>('');

  /** @description Lead-in text of the drop-area call to action, before the browse link. Localize per app. */
  readonly ctaText = input('Drag and drop or ');

  /** @description Label of the inline browse link and of the `button`-variant upload button. Localize per app. */
  readonly chooseFilesText = input('Choose files');

  /** @description Drop-area text while a drag hovers it. Localize per app. */
  readonly dropzoneActiveText = input('Release to upload');

  /** @description Builds the left caption from the formats `accept` lists. Localize per app. */
  readonly formatsCaption = input<(formats: string) => string>((formats) => `Accepted formats: ${formats}`);

  /** @description Builds the right caption from the formatted `maxSize`. Localize per app. */
  readonly maxSizeCaption = input<(size: string) => string>((size) => `Max size: ${size}`);

  /** @description Accessible-label prefix of each row's remove button. Localize per app. */
  readonly removeLabel = input('Remove file');

  /**
   * @description Accessible name of the built-in file list. Localize per app; set to an
   * empty string to leave the list unnamed. Without it a screen-reader user
   * navigating by list hears only "list, 2 items", with no clue which field
   * owns it — which matters on forms carrying several file inputs.
   */
  readonly fileListLabel = input('Selected files');

  /**
   * @description Word appended to the label, for assistive tech only, while `required`
   * is set. Localize per app. The visible asterisk stays `aria-hidden`, and
   * `aria-required` cannot be used because the browse control is a button.
   */
  readonly requiredLabel = input('required');

  /** @description Builds the live-region announcement for added files. Localize per app. */
  readonly announceAdded = input<(files: readonly File[]) => string>((files) =>
    files.length === 1 ? `${files[0].name} added` : `${files.length} files added`,
  );

  /** @description Builds the live-region announcement for a removed file. Localize per app. */
  readonly announceRemoved = input<(file: File) => string>((file) => `${file.name} removed`);

  /** @description Builds the live-region announcement for a rejected file. Localize per app. */
  readonly announceRejected = input<(rejection: MudFileInputRejection) => string>(
    (rejection) => `${rejection.file.name} was rejected`,
  );

  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the browse control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Fired once per rejected file (type / size / count). */
  readonly rejected = output<MudFileInputRejection>();

  /** Fired when a file is removed from the built-in list. */
  readonly removed = output<MudFileInputRemove>();

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _browse = viewChild<ElementRef<HTMLButtonElement>>('browse');
  private readonly _rows = viewChildren(MudFileItem);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-file-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
  protected readonly _browseId = `${this._id}-browse`;

  /** @docs-private role=status live text announcing add / remove / reject. */
  protected readonly _announcement = signal('');

  protected readonly _dragOver = signal(false);
  private _dragDepth = 0;

  /** Object-URL previews for image files, revoked on removal / destroy. */
  private readonly _previewUrls = new Map<File, string>();
  private readonly _previewVersion = signal(0);

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: File[]) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _formatsCaption = computed<string | undefined>(() => {
    const accept = this.accept()?.trim();

    if (!accept) return undefined;

    const formats = this._formatsFromAccept(accept);

    return formats ? this.formatsCaption()(formats) : undefined;
  });

  protected readonly _maxSizeCaption = computed<string | undefined>(() => {
    const maxSize = this.maxSize();

    if (maxSize === undefined) return undefined;

    return this.maxSizeCaption()(this._formatBytes(maxSize));
  });

  protected readonly _hasCaptions = computed(
    () => !!this._formatsCaption() || !!this._maxSizeCaption(),
  );

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

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'file-field', `file-field--${this.variant()}`];

    if (this.size() === 'large') classes.push('file-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._dragOver()) classes.push('is-dragover');

    return classes.join(' ');
  });

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudInputFieldStyles);
    styles.load(_MudFileInputStyles);

    inject(DestroyRef).onDestroy(() => {
      for (const url of this._previewUrls.values()) this._revokeUrl(url);

      this._previewUrls.clear();
    });
  }

  writeValue(value: readonly File[] | null | undefined): void {
    this.value.set(value ? [...value] : []);
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  /** @description Focuses the browse control (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._browse()?.nativeElement.focus(options);
  }

  /** @docs-private Preview URL for the built-in list rows; images only. */
  protected _previewFor(file: File): string | undefined {
    this._previewVersion();

    return this._previewUrls.get(file);
  }

  private _validateFile(file: File): MudFileInputRejectionCode | null {
    const accept = this.accept()?.trim();

    if (accept) {
      const tokens = accept
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);

      if (tokens.length > 0) {
        const filename = file.name.toLowerCase();
        const mime = file.type.toLowerCase();
        const matches = tokens.some((token) => {
          if (token.startsWith('.')) return filename.endsWith(token);

          if (token.endsWith('/*')) return mime.startsWith(`${token.slice(0, -2)}/`);

          return mime === token;
        });

        if (!matches) return 'type';
      }
    }

    const maxSize = this.maxSize();

    if (maxSize !== undefined && file.size > maxSize) return 'size';

    return null;
  }

  private _intake(incoming: readonly File[]): void {
    const accepted: File[] = [];
    let lastRejection: MudFileInputRejection | undefined;

    const maxFiles = this.maxFiles();
    let remaining =
      maxFiles !== undefined ? Math.max(0, maxFiles - (this.multiple() ? this.value().length : 0)) : Infinity;

    for (const file of incoming) {
      let code = this._validateFile(file);

      if (code === null && remaining <= 0) code = 'count';

      if (code !== null) {
        const rejection: MudFileInputRejection = { code, file };

        lastRejection = rejection;
        this.rejected.emit(rejection);
        continue;
      }

      accepted.push(file);
      remaining -= 1;
    }

    if (accepted.length > 0) {
      const next = this.multiple() ? [...this.value(), ...accepted] : accepted.slice(0, 1);

      this._createPreviews(this.multiple() ? accepted : next);

      if (!this.multiple()) this._dropStalePreviews(next);

      this.value.set(next);
      this._onChange(next);
    }

    // A mixed batch announces both halves — one live region, one message.
    const parts: string[] = [];

    if (accepted.length > 0) parts.push(this.announceAdded()(accepted));

    if (lastRejection) parts.push(this.announceRejected()(lastRejection));

    if (parts.length > 0) this._announce(parts.join(' '));
  }

  private _removeAt(index: number): void {
    const file = this.value()[index];

    if (file === undefined) return;

    const next = this.value().filter((_, i) => i !== index);

    this._dropStalePreviews(next);
    this.value.set(next);
    this._onChange(next);
    this._announce(this.announceRemoved()(file));
    this.removed.emit({ file, index, files: next });

    // The button that was just pressed is gone; without this, focus falls back
    // to the document body and a keyboard user loses their place in the list.
    // `@for` tracks by $index, so the row node at this index already exists and
    // is reused for the file that shifts into the slot — focusing it now lands
    // on the right control without waiting for change detection.
    if (next.length === 0 || !this._rows()[Math.min(index, next.length - 1)]?.focusRemove()) {
      this.focus();
    }
  }

  private _createPreviews(files: readonly File[]): void {
    if (!this._isBrowser || typeof URL.createObjectURL !== 'function') return;

    for (const file of files) {
      if (!file.type.startsWith('image/') || this._previewUrls.has(file)) continue;

      this._previewUrls.set(file, URL.createObjectURL(file));
    }

    this._previewVersion.update((version) => version + 1);
  }

  private _dropStalePreviews(kept: readonly File[]): void {
    const keep = new Set(kept);

    for (const [file, url] of this._previewUrls) {
      if (keep.has(file)) continue;

      this._revokeUrl(url);
      this._previewUrls.delete(file);
    }

    this._previewVersion.update((version) => version + 1);
  }

  private _revokeUrl(url: string): void {
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  }

  /**
   * A repeated message (same file rejected twice) would leave the live
   * region's DOM unchanged and never re-announce — alternate a trailing
   * zero-width space to force a mutation screen readers pick up.
   */
  private _announce(message: string): void {
    this._announcement.set(this._announcement() === message ? `${message}\u200B` : message);
  }

  protected _onBrowseClick(event: MouseEvent): void {
    if (this._effectiveDisabled()) return;

    event.preventDefault();
    // The inline browse link stops here so the dropzone's own click handler
    // does not open the picker a second time.
    event.stopPropagation();
    this._native().nativeElement.click();
  }

  protected _onNativeChange(event: Event): void {
    const native = event.target as HTMLInputElement;
    const files = native.files ? Array.from(native.files) : [];

    if (files.length > 0) this._intake(files);

    // Allow the same file to be picked again.
    native.value = '';
  }

  protected _onDragEnter(event: DragEvent): void {
    if (this._effectiveDisabled()) return;

    event.preventDefault();
    this._dragDepth += 1;
    this._dragOver.set(true);
  }

  protected _onDragOver(event: DragEvent): void {
    if (this._effectiveDisabled()) return;

    // preventDefault is what makes the element a valid drop target.
    event.preventDefault();

    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected _onDragLeave(): void {
    if (this._effectiveDisabled()) return;

    this._dragDepth = Math.max(0, this._dragDepth - 1);

    if (this._dragDepth === 0) this._dragOver.set(false);
  }

  protected _onDrop(event: DragEvent): void {
    if (this._effectiveDisabled()) return;

    event.preventDefault();
    this._dragDepth = 0;
    this._dragOver.set(false);

    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];

    if (files.length > 0) this._intake(files);
  }

  protected _onItemRemoved(index: number): void {
    if (this._effectiveDisabled()) return;

    this._removeAt(index);
  }

  /** @docs-private Focus moving inside the control (browse ↔ remove buttons) is not leaving it. */
  protected _onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (next && this._host.contains(next)) return;

    this._onTouched();
    this.touch.emit();
  }

  // ----- derivations -----

  private _formatsFromAccept(accept: string): string {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const raw of accept.split(',')) {
      const token = raw.trim().toLowerCase();

      if (!token) continue;

      let extension: string | null = null;

      if (token.startsWith('.')) extension = token.slice(1);
      else if (token.endsWith('/*')) extension = token.slice(0, -2);
      else if (token in MIME_EXTENSIONS) extension = MIME_EXTENSIONS[token];
      else if (token.includes('/')) extension = token.split('/').pop() ?? null;

      if (extension && !seen.has(extension)) {
        seen.add(extension);
        out.push(extension);
      }
    }

    return out.join(', ');
  }

  private _formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }

    const rounded = value.toFixed(1).replace(/\.0$/, '');

    return `${rounded} ${units[unit]}`;
  }
}
