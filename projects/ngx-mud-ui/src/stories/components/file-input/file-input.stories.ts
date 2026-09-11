import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { MudFileInput, MudFileItem } from 'ngx-mud-ui/file-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
// `document` is aliased so it cannot shadow the global inside this module.
import {
  MudIconComponent,
  provideMudIcons,
  attachment,
  document as documentIcon,
  image,
  pdfFile,
} from 'ngx-mud-ui/icons';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:560px;padding:24px';

const meta: Meta<MudFileInput> = {
  title: 'Components/File input',
  component: MudFileInput,
  decorators: [moduleMetadata({ imports: [MudFileInput, MudLabel, MudInlineMessage] })],
  args: {
    variant: 'dropzone',
    size: 'medium',
    accept: '.pdf,image/jpeg,image/png',
    multiple: true,
    maxSize: 5 * 1024 * 1024,
    disabled: false,
    required: false,
    invalid: false,
    showFileList: true,
  },
};

export default meta;

type Story = StoryObj<MudFileInput>;

/**
 * The captions under the drop zone are derived from `accept` and `maxSize`;
 * localize their wording via the `formatsCaption` / `maxSizeCaption` functions.
 */
export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-file-input
          [variant]="variant"
          [size]="size"
          [accept]="accept"
          [multiple]="multiple"
          [maxFiles]="maxFiles"
          [maxSize]="maxSize"
          [disabled]="disabled"
          [required]="required"
          [invalid]="invalid"
          [showFileList]="showFileList"
        >
          <mud-label>Documente justificative</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Trebuie să încărcați cel puțin un document.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Încărcați copia buletinului și dovada de plată.</mud-inline-message>
          }
        </mud-file-input>
      </div>
    `,
  }),
};

/**
 * `dropzone` is the full drag-and-drop surface; `button` collapses to a single
 * upload button. Both share the file list, captions and validation.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-file-input accept=".pdf" [maxSize]="5242880" multiple>
          <mud-label>Dropzone</mud-label>
        </mud-file-input>
        <mud-file-input variant="button" accept=".pdf" [maxSize]="5242880" multiple>
          <mud-label>Buton</mud-label>
        </mud-file-input>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-file-input accept=".pdf">
          <mud-label>Implicit</mud-label>
          <mud-inline-message hideIcon>Un singur fișier PDF.</mud-inline-message>
        </mud-file-input>
        <mud-file-input required invalid>
          <mud-label>Obligatoriu, invalid</mud-label>
          <mud-inline-message variant="error">Trebuie să încărcați cel puțin un document.</mud-inline-message>
        </mud-file-input>
        <mud-file-input disabled>
          <mud-label>Dezactivat</mud-label>
          <mud-inline-message hideIcon>Nu este disponibil în această etapă.</mud-inline-message>
        </mud-file-input>
        <mud-file-input size="large" accept="image/*" [maxSize]="10485760" multiple>
          <mud-label>Mare (large)</mud-label>
        </mud-file-input>
      </div>
    `,
  }),
};

/**
 * `mud-file-item` is exported from the same entry point and renders standalone,
 * which is how you drive per-file upload state yourself. `uploaded` and `error`
 * rows are removable; `uploading` shows a spinner and `success` a tick.
 */
export const FileItemStates: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [MudFileItem] })],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-file-item filename="buletin.pdf" [size]="245760" />
        <mud-file-item filename="dovada-plata.pdf" [size]="1048576" state="uploading" />
        <mud-file-item filename="cerere-semnata.pdf" [size]="524288" state="success" />
        <mud-file-item
          filename="scan-foarte-mare-cu-nume-lung-care-se-trunchiaza.tiff"
          [size]="94371840"
          state="error"
          errorText="Fișierul depășește limita de 5 MB."
        />
        <mud-file-item filename="rezumat.pdf" [size]="12288" [removable]="false" />
        <mud-file-item filename="arhiva.zip" [size]="7340032" disabled />
      </div>
    `,
  }),
};

/**
 * Project an `[icon]` to replace the leading file glyph — here a per-extension
 * icon. This is also the hook for an `<img ngSrc>` when previews come from a
 * server: `previewSrc` mints object URLs, which `NgOptimizedImage` rejects.
 *
 * A `previewSrc` thumbnail still wins over the projected icon, and the `error`
 * state drops the leading icon entirely.
 */
export const ProjectedIcon: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    applicationConfig({ providers: [provideMudIcons([attachment, documentIcon, image, pdfFile])] }),
    moduleMetadata({ imports: [MudFileItem, MudIconComponent] }),
  ],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-file-item filename="cerere.pdf" [size]="245760">
          <mud-icon icon name="pdf-file" />
        </mud-file-item>
        <mud-file-item filename="fotografie.png" [size]="1048576">
          <mud-icon icon name="image" />
        </mud-file-item>
        <mud-file-item filename="proces-verbal.docx" [size]="524288">
          <mud-icon icon name="document" />
        </mud-file-item>
        <mud-file-item filename="anexa.zip" [size]="7340032">
          <mud-icon icon name="attachment" />
        </mud-file-item>
        <mud-file-item filename="fara-icon-proiectat.pdf" [size]="12288" />
      </div>
    `,
  }),
};

/** Any number of consumer-timed messages, and a rich label, can be projected. */
export const Composable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-file-input accept=".pdf" [maxSize]="5242880">
          <mud-label>Contract semnat <strong>(obligatoriu)</strong></mud-label>
          <mud-inline-message hideIcon>
            Semnătura electronică se verifică prin <a href="#" (click)="$event.preventDefault()">MSign</a>.
          </mud-inline-message>
        </mud-file-input>
        <mud-file-input invalid required accept=".pdf">
          <mud-label>Dovada de plată</mud-label>
          <mud-inline-message variant="error">Documentul nu a putut fi validat. Încercați din nou.</mud-inline-message>
        </mud-file-input>
      </div>
    `,
  }),
};

/**
 * Reactive forms: the control value is the `File[]` itself, so
 * `Validators.required` works (Angular treats an empty array as empty) and
 * custom validators receive the real files. Pick a file, then remove it again
 * to see the control turn invalid.
 */
@Component({
  selector: 'mud-file-input-reactive-demo',
  imports: [MudFileInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-file-input
        required
        accept=".pdf,image/*"
        multiple
        [maxSize]="2097152"
        [formControl]="documents"
        [invalid]="documents.touched && documents.invalid"
      >
        <mud-label>Documente justificative</mud-label>
        @if (documents.touched && documents.invalid) {
          <mud-inline-message variant="error">{{ errorText }}</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>Cel puțin un document; maximum 2 MB fiecare, 5 MB în total.</mud-inline-message>
        }
      </mud-file-input>
      <code>
        files: {{ names || '—' }} | touched: {{ documents.touched }} | valid: {{ documents.valid }}
      </code>
    </div>
  `,
})
class FileInputReactiveDemo {
  readonly documents = new FormControl<File[]>([], {
    nonNullable: true,
    validators: [Validators.required, totalSizeUnder(5 * 1024 * 1024)],
  });

  get names(): string {
    return this.documents.value.map((file) => file.name).join(', ');
  }

  get errorText(): string {
    return this.documents.hasError('totalSize')
      ? 'Documentele depășesc 5 MB în total.'
      : 'Încărcați cel puțin un document.';
  }
}

/** Total-size rule across the whole selection — the per-file cap is `maxSize`. */
function totalSizeUnder(limit: number) {
  return (control: { value: File[] | null }) => {
    const total = (control.value ?? []).reduce((sum, file) => sum + file.size, 0);

    return total > limit ? { totalSize: { limit, total } } : null;
  };
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudFileInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-file-input
      required
      accept=".pdf,image/*"
      multiple
      [maxSize]="2097152"
      [formControl]="documents"
      [invalid]="documents.touched && documents.invalid"
    >
      <mud-label>Documente justificative</mud-label>
      @if (documents.touched && documents.invalid) {
        <mud-inline-message variant="error">{{ errorText }}</mud-inline-message>
      }
    </mud-file-input>
  \`,
})
export class DocumentsField {
  // The value is a real File[], so Validators.required rejects an empty array
  // and custom validators receive the files themselves.
  readonly documents = new FormControl<File[]>([], {
    nonNullable: true,
    validators: [Validators.required, totalSizeUnder(5 * 1024 * 1024)],
  });

  get errorText(): string {
    return this.documents.hasError('totalSize')
      ? 'Documentele depășesc 5 MB în total.'
      : 'Încărcați cel puțin un document.';
  }
}

function totalSizeUnder(limit: number) {
  return (control: AbstractControl<File[]>) => {
    const total = (control.value ?? []).reduce((sum, file) => sum + file.size, 0);

    return total > limit ? { totalSize: { limit, total } } : null;
  };
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [FileInputReactiveDemo] })],
  render: () => ({ template: `<mud-file-input-reactive-demo />` }),
};

/**
 * Signal forms via the FormValueControl contract: `[formField]` binds the
 * value, the required marker and the raw validation state. This reflects
 * signal forms' RAW invalid state (errors show immediately), so the message
 * is guarded on `touched()` to keep the display consumer-timed.
 */
@Component({
  selector: 'mud-file-input-signal-demo',
  imports: [MudFileInput, MudLabel, MudInlineMessage, FormField],
  template: `
    <div style="${COL}">
      <mud-file-input accept=".pdf,image/*" multiple [maxSize]="2097152" [formField]="form.documents">
        <mud-label>Documente justificative</mud-label>
        @if (form.documents().touched() && form.documents().invalid()) {
          <mud-inline-message variant="error">Încărcați cel puțin un document.</mud-inline-message>
        } @else {
          <mud-inline-message hideIcon>Cel puțin un document.</mud-inline-message>
        }
      </mud-file-input>
      <code>
        files: {{ names() || '—' }} | touched: {{ form.documents().touched() }} | valid:
        {{ form.documents().valid() }}
      </code>
    </div>
  `,
})
class FileInputSignalDemo {
  readonly model = signal<{ documents: File[] }>({ documents: [] });

  readonly form = form(this.model, (path) => {
    required(path.documents, { message: 'Încărcați cel puțin un document.' });
    minLength(path.documents, 1, { message: 'Încărcați cel puțin un document.' });
  });

  readonly names = computed(() => this.model().documents.map((file) => file.name).join(', '));
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const SIGNAL_FORMS_SOURCE = `
@Component({
  imports: [MudFileInput, MudLabel, MudInlineMessage, FormField],
  template: \`
    <mud-file-input accept=".pdf,image/*" multiple [maxSize]="2097152" [formField]="form.documents">
      <mud-label>Documente justificative</mud-label>
      @if (form.documents().touched() && form.documents().invalid()) {
        <mud-inline-message variant="error">Încărcați cel puțin un document.</mud-inline-message>
      }
    </mud-file-input>
  \`,
})
export class DocumentsField {
  readonly model = signal<{ documents: File[] }>({ documents: [] });

  // Signal forms bind \`required\` and \`invalid\` on the control for you —
  // minLength(…, 1) is what makes an empty array fail; required alone only
  // marks the field. The message stays yours to project and time.
  readonly form = form(this.model, (path) => {
    required(path.documents, { message: 'Încărcați cel puțin un document.' });
    minLength(path.documents, 1, { message: 'Încărcați cel puțin un document.' });
  });
}
`;

export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SIGNAL_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [FileInputSignalDemo] })],
  render: () => ({ template: `<mud-file-input-signal-demo />` }),
};

/**
 * Upload is consumer-driven. Turn `showFileList` off, keep the files in your
 * own state and render `mud-file-item` rows whose `state` you control.
 */
@Component({
  selector: 'mud-file-input-upload-demo',
  imports: [MudFileInput, MudLabel, MudFileItem],
  template: `
    <div style="${COL}">
      <mud-file-input
        accept=".pdf,image/*"
        multiple
        [showFileList]="false"
        [value]="files()"
        (valueChange)="onPicked($event)"
      >
        <mud-label>Documente</mud-label>
      </mud-file-input>
      @for (row of rows(); track row.file) {
        <mud-file-item
          [filename]="row.file.name"
          [size]="row.file.size"
          [state]="row.state"
          [errorText]="row.error"
          (removed)="remove(row.file)"
        />
      }
    </div>
  `,
})
class FileInputUploadDemo {
  readonly files = signal<File[]>([]);
  readonly rows = signal<{ file: File; state: 'uploading' | 'success' | 'error'; error?: string }[]>([]);

  onPicked(files: File[]): void {
    this.files.set(files);
    this.rows.set(
      files.map((file, index) => ({
        file,
        state: index === 0 ? 'success' : index === 1 ? 'uploading' : 'error',
        error: index >= 2 ? 'Încărcarea a eșuat. Reîncercați.' : undefined,
      })),
    );
  }

  remove(file: File): void {
    this.files.update((list) => list.filter((entry) => entry !== file));
    this.rows.update((list) => list.filter((row) => row.file !== file));
  }
}

/**
 * Shown as this story's code sample: the story renders a demo component whose
 * selector alone would tell a reader nothing.
 */
const UPLOAD_SOURCE = `
@Component({
  imports: [MudFileInput, MudLabel, MudFileItem],
  template: \`
    <mud-file-input
      accept=".pdf,image/*"
      multiple
      [showFileList]="false"
      [value]="files()"
      (valueChange)="onPicked($event)"
    >
      <mud-label>Documente</mud-label>
    </mud-file-input>
    @for (row of rows(); track row.file) {
      <mud-file-item
        [filename]="row.file.name"
        [size]="row.file.size"
        [state]="row.state"
        [errorText]="row.error"
        (removed)="remove(row.file)"
      />
    }
  \`,
})
export class DocumentUpload {
  readonly files = signal<File[]>([]);
  readonly rows = signal<UploadRow[]>([]);

  // The component owns selection + validation; progress is yours. Push each
  // accepted file through your upload service and move its row's \`state\`.
  onPicked(files: File[]): void {
    this.files.set(files);
    this.rows.set(files.map((file) => ({ file, state: 'uploading' })));
  }

  remove(file: File): void {
    this.files.update((list) => list.filter((entry) => entry !== file));
    this.rows.update((list) => list.filter((row) => row.file !== file));
  }
}
`;

export const ConsumerDrivenUpload: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: UPLOAD_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [FileInputUploadDemo] })],
  render: () => ({ template: `<mud-file-input-upload-demo />` }),
};
