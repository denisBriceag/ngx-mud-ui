import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudFileInput } from './mud-file-input.component';
import { MudFileItem } from './mud-file-item.component';
import { MUD_LABELS_RO, MUD_LABELS_RU, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type {
  MudFileInputRejection,
  MudFileInputRemove,
  MudFileInputVariant,
} from './mud-file-input.component';

function makeFile(name: string, size = 4, type = 'application/pdf'): File {
  return new File(['x'.repeat(size)], name, { type });
}

function dragEvent(type: string, files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });

  Object.defineProperty(event, 'dataTransfer', { value: { files, dropEffect: '' } });

  return event;
}

@Component({
  imports: [MudFileInput, MudLabel, MudInlineMessage],
  template: `
    <mud-file-input
      [(value)]="files"
      [variant]="variant()"
      [accept]="accept()"
      [formatsCaption]="formatsCaption()"
      [maxSizeCaption]="maxSizeCaption()"
      [multiple]="multiple()"
      [maxFiles]="maxFiles()"
      [maxSize]="maxSize()"
      [disabled]="disabled()"
      [required]="required()"
      [invalid]="invalid()"
      [showFileList]="showFileList()"
      [fileListLabel]="fileListLabel()"
      [removeLabel]="removeLabel()"
      (rejected)="rejections.push($event)"
      (removed)="removals.push($event)"
    >
      @if (withLabel()) {
        <mud-label>Documente</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Helper.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Error.</mud-inline-message>
      }
    </mud-file-input>
  `,
})
class Host {
  readonly files = signal<File[]>([]);
  readonly variant = signal<MudFileInputVariant>('dropzone');
  readonly accept = signal<string | undefined>(undefined);
  readonly formatsCaption = signal<((formats: readonly string[]) => string) | undefined>(undefined);
  readonly maxSizeCaption = signal<((size: string) => string) | undefined>(undefined);
  readonly removeLabel = signal<((filename: string) => string) | undefined>(undefined);
  readonly multiple = signal(true);
  readonly maxFiles = signal<number | undefined>(undefined);
  readonly maxSize = signal<number | undefined>(undefined);
  readonly disabled = signal(false);
  readonly required = signal(false);
  readonly invalid = signal(false);
  readonly showFileList = signal(true);
  readonly fileListLabel = signal<string | undefined>(undefined);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
  readonly rejections: MudFileInputRejection[] = [];
  readonly removals: MudFileInputRemove[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-file-input') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    native: () => el.querySelector('.file-field__native') as HTMLInputElement,
    dropzone: () => el.querySelector('.file-field__dropzone') as HTMLElement | null,
    chooseBtn: () => el.querySelector('.file-field__browse') as HTMLButtonElement | null,
    uploadBtn: () => el.querySelector('.file-field__upload-button') as HTMLButtonElement | null,
    label: () => el.querySelector('.file-field__label') as HTMLLabelElement | null,
    captions: () => el.querySelector('.file-field__captions') as HTMLElement | null,
    items: () => Array.from(el.querySelectorAll<HTMLElement>('mud-file-item')),
    live: () => el.querySelector('[role="status"]') as HTMLElement,
    assistive: () => el.querySelector('.input-field__assistive') as HTMLElement | null,
    error: () => el.querySelector('[role="alert"]') as HTMLElement | null,
  };
}

async function pick(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, files: File[]) {
  Object.defineProperty(native, 'files', { value: files, configurable: true });
  native.dispatchEvent(new Event('change', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudFileInput', () => {
  it('baseline: renders max sizes in English exactly as before the localization', async () => {
    const { fixture, host, captions } = await render();
    const out: string[] = [];

    for (const bytes of [0, 1023, 1024, 1572864, 5 * 1024 ** 3]) {
      host.maxSize.set(bytes);
      await fixture.whenStable();
      out.push(captions()!.textContent!.trim());
    }

    expect(out).toEqual(['Max size: 0 B', 'Max size: 1023 B', 'Max size: 1 KB', 'Max size: 1.5 MB', 'Max size: 5 GB']);
  });

  it('renders the label, required mark and the dropzone with its call to action', async () => {
    const { fixture, host, label, dropzone, chooseBtn } = await render();

    host.required.set(true);
    await fixture.whenStable();

    expect(label()?.textContent).toContain('Documente');
    expect(label()?.textContent).toContain('*');
    expect(dropzone()).not.toBeNull();
    expect(dropzone()?.textContent).toContain('Drag and drop or');
    expect(chooseBtn()?.textContent?.trim()).toBe('Choose files');
    expect(chooseBtn()?.getAttribute('aria-labelledby')).toBe(label()?.id);
  });

  it('conveys required through the label, never as aria-required on the button', async () => {
    const { fixture, host, el, label, chooseBtn } = await render();

    host.required.set(true);
    await fixture.whenStable();

    // `aria-required` is not an allowed attribute on role=button (axe
    // `aria-allowed-attr`), so the requirement rides the accessible name —
    // which the button borrows from the label via aria-labelledby.
    expect(chooseBtn()?.hasAttribute('aria-required')).toBe(false);
    expect(label()?.textContent).toContain('required');
    expect(el.querySelector('.file-field__required-text')?.className).toContain('sr-only');

    // The hidden native control still carries the real constraint.
    expect((el.querySelector('.file-field__native') as HTMLInputElement).required).toBe(true);

    host.required.set(false);
    await fixture.whenStable();
    expect(label()?.textContent).not.toContain('required');
  });

  it('renders no label element without a projected mud-label; aria-labelledby drops too', async () => {
    const { fixture, host, label, chooseBtn } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(label()).toBeNull();
    expect(chooseBtn()?.getAttribute('aria-labelledby')).toBeNull();
  });

  it('lands focus predictably after removing a row', async () => {
    const { fixture, host, native, el } = await render();

    await pick(fixture, native(), [makeFile('a.pdf'), makeFile('b.pdf'), makeFile('c.pdf')]);

    const removeButtons = () =>
      Array.from(el.querySelectorAll<HTMLButtonElement>('.file-item__remove'));

    // Removing a middle row moves focus onto the row that takes its place.
    removeButtons()[1].focus();
    removeButtons()[1].click();
    await fixture.whenStable();

    expect(host.files().map((file) => file.name)).toEqual(['a.pdf', 'c.pdf']);
    expect(document.activeElement).toBe(removeButtons()[1]);
    expect(document.activeElement?.getAttribute('aria-label')).toContain('c.pdf');

    // Removing the last row falls back to the row before it.
    removeButtons()[1].click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(removeButtons()[0]);

    // Emptying the list hands focus back to the browse control.
    removeButtons()[0].click();
    await fixture.whenStable();
    expect(el.querySelectorAll('mud-file-item')).toHaveLength(0);
    expect(document.activeElement).toBe(el.querySelector('.file-field__browse'));
  });

  it('renders an upload button instead of the dropzone in the button variant', async () => {
    const { fixture, host, dropzone, uploadBtn } = await render();

    host.variant.set('button');
    await fixture.whenStable();

    expect(dropzone()).toBeNull();
    expect(uploadBtn()).not.toBeNull();
    expect(uploadBtn()?.textContent?.trim()).toBe('Choose files');
  });

  it('derives the captions from accept and maxSize', async () => {
    const { fixture, host, captions } = await render();

    expect(captions()).toBeNull();

    host.accept.set('image/jpeg,image/png,.pdf');
    host.maxSize.set(5 * 1024 * 1024);
    await fixture.whenStable();

    expect(captions()?.textContent).toContain('Accepted formats: jpg, png, pdf');
    expect(captions()?.textContent).toContain('Max size: 5 MB');
  });

  it('localizes the captions through the formatsCaption and maxSizeCaption functions', async () => {
    const { fixture, host, captions } = await render();

    host.accept.set('.pdf');
    host.maxSize.set(1024 * 1024);
    host.formatsCaption.set((formats) => `Formate acceptate: ${formats.join(' | ')}`);
    host.maxSizeCaption.set((size: string) => `Dimensiune maximă: ${size}`);
    await fixture.whenStable();

    expect(captions()?.textContent).toContain('Formate acceptate: pdf');
    expect(captions()?.textContent).toContain('Dimensiune maximă: 1 MB');
  });

  it('opens the native picker from the choose-files button and the dropzone surface', async () => {
    const { fixture, host, native, dropzone, chooseBtn } = await render();
    const clicks = vi.spyOn(native(), 'click');

    chooseBtn()!.click();
    expect(clicks).toHaveBeenCalledTimes(1);

    dropzone()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toHaveBeenCalledTimes(2);

    host.disabled.set(true);
    await fixture.whenStable();
    dropzone()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicks).toHaveBeenCalledTimes(2);
  });

  it('adds picked files to the value, announces them and clears the native input', async () => {
    const { fixture, host, native, live } = await render();

    await pick(fixture, native(), [makeFile('a.pdf'), makeFile('b.pdf')]);

    expect(host.files().map((file) => file.name)).toEqual(['a.pdf', 'b.pdf']);
    expect(live().textContent).toContain('2 files added');
    expect(native().value).toBe('');

    await pick(fixture, native(), [makeFile('c.pdf')]);
    expect(host.files().map((file) => file.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);
    expect(live().textContent).toContain('c.pdf added');
  });

  it('keeps only the first file and replaces the value when multiple is off', async () => {
    const { fixture, host, native } = await render();

    host.multiple.set(false);
    await fixture.whenStable();

    await pick(fixture, native(), [makeFile('a.pdf'), makeFile('b.pdf')]);
    expect(host.files().map((file) => file.name)).toEqual(['a.pdf']);

    await pick(fixture, native(), [makeFile('c.pdf')]);
    expect(host.files().map((file) => file.name)).toEqual(['c.pdf']);
  });

  it('rejects files that do not match accept', async () => {
    const { fixture, host, native, live } = await render();

    host.accept.set('image/*,.pdf');
    await fixture.whenStable();

    const bad = makeFile('run.exe', 4, 'application/x-msdownload');
    const image = makeFile('photo.png', 4, 'image/png');

    await pick(fixture, native(), [bad, image]);

    expect(host.files().map((file) => file.name)).toEqual(['photo.png']);
    expect(host.rejections).toEqual([{ code: 'type', file: bad }]);
    expect(live().textContent).toContain('run.exe was rejected');
  });

  it('rejects files above maxSize', async () => {
    const { fixture, host, native } = await render();

    host.maxSize.set(8);
    await fixture.whenStable();

    const big = makeFile('big.pdf', 9);

    await pick(fixture, native(), [big, makeFile('ok.pdf', 8)]);

    expect(host.files().map((file) => file.name)).toEqual(['ok.pdf']);
    expect(host.rejections).toEqual([{ code: 'size', file: big }]);
  });

  it('rejects files beyond the remaining maxFiles slots', async () => {
    const { fixture, host, native } = await render();

    host.maxFiles.set(2);
    await fixture.whenStable();

    await pick(fixture, native(), [makeFile('a.pdf')]);

    const overflow = makeFile('c.pdf');

    await pick(fixture, native(), [makeFile('b.pdf'), overflow]);

    expect(host.files().map((file) => file.name)).toEqual(['a.pdf', 'b.pdf']);
    expect(host.rejections).toEqual([{ code: 'count', file: overflow }]);
  });

  it('accepts drops, tracks the drag-over state with an activation text', async () => {
    const { fixture, host, el, dropzone, live } = await render();

    dropzone()!.dispatchEvent(dragEvent('dragenter'));
    await fixture.whenStable();
    expect(el.classList.contains('is-dragover')).toBe(true);
    expect(dropzone()?.textContent).toContain('Release to upload');

    // A child enter + leave must not end the drag (depth counter).
    dropzone()!.dispatchEvent(dragEvent('dragenter'));
    dropzone()!.dispatchEvent(dragEvent('dragleave'));
    await fixture.whenStable();
    expect(el.classList.contains('is-dragover')).toBe(true);

    dropzone()!.dispatchEvent(dragEvent('drop', [makeFile('dropped.pdf')]));
    await fixture.whenStable();

    expect(el.classList.contains('is-dragover')).toBe(false);
    expect(host.files().map((file) => file.name)).toEqual(['dropped.pdf']);
    expect(live().textContent).toContain('dropped.pdf added');
  });

  it('ignores drops while disabled', async () => {
    const { fixture, host, dropzone } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    dropzone()!.dispatchEvent(dragEvent('drop', [makeFile('a.pdf')]));
    await fixture.whenStable();

    expect(host.files()).toEqual([]);
  });

  it('renders a file-item row per file and removes through it', async () => {
    const { fixture, host, items, live } = await render();
    const kept = makeFile('keep.pdf');
    const dropped = makeFile('drop.pdf', 6);

    host.files.set([kept, dropped]);
    await fixture.whenStable();

    expect(items()).toHaveLength(2);
    expect(items()[1].textContent).toContain('drop.pdf');
    expect(items()[1].textContent).toContain('6 B');

    (items()[1].querySelector('.file-item__remove') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(host.files()).toEqual([kept]);
    expect(host.removals).toEqual([{ file: dropped, index: 1, files: [kept] }]);
    expect(live().textContent).toContain('drop.pdf removed');
  });

  it('texts and captions come from the labels and the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO), provideMudFormatLocale('ro-MD')] });
    const { fixture, host, el, captions, chooseBtn } = await render();

    host.accept.set('.pdf,.png');
    host.maxSize.set(1572864);
    host.required.set(true);
    host.files.set([makeFile('a.pdf')]);
    await fixture.whenStable();

    expect(chooseBtn()!.textContent!.trim()).toBe(MUD_LABELS_RO.fileInput!.chooseFiles);
    expect(el.querySelector('.file-field__dropzone-cta-body')!.textContent).toBe(MUD_LABELS_RO.fileInput!.cta);
    expect(el.querySelector('.file-field__required-text')!.textContent).toBe(MUD_LABELS_RO.fileInput!.required);
    expect(el.querySelector('.file-field__list')!.getAttribute('aria-label')).toBe(MUD_LABELS_RO.fileInput!.fileList);
    expect(captions()!.textContent).toContain('Formate acceptate: pdf, png');
    expect(captions()!.textContent).toContain('Mărime maximă: 1,5 MB');
    expect(el.querySelector('mud-file-item .file-item__remove')!.getAttribute('aria-label')).toBe('Elimină fișierul a.pdf');
  });

  it('instance function inputs win over the labels, removeLabel reaching every row', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, host, el, captions } = await render();

    host.accept.set('.pdf');
    host.formatsCaption.set((formats) => `Only ${formats.join('/')}`);
    host.removeLabel.set((name) => `Drop ${name}`);
    host.files.set([makeFile('a.pdf'), makeFile('b.pdf')]);
    await fixture.whenStable();

    expect(captions()!.textContent).toContain('Only pdf');
    const labels = Array.from(el.querySelectorAll('.file-item__remove')).map((b) => b.getAttribute('aria-label'));

    expect(labels).toEqual(['Drop a.pdf', 'Drop b.pdf']);
  });

  it('announcements use the pack, with Russian plurals through the component', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RU)] });
    const { fixture, native, live } = await render();

    await pick(fixture, native(), [makeFile('a.pdf'), makeFile('b.pdf')]);
    expect(live().textContent).toContain('файла');
    expect(live().textContent).toContain('Добавлено 2 файла');
  });

  it('names the file list with the localizable fileListLabel', async () => {
    const { fixture, host, el } = await render();

    host.files.set([makeFile('a.pdf')]);
    await fixture.whenStable();

    const list = el.querySelector('.file-field__list') as HTMLElement;

    expect(list.getAttribute('aria-label')).toBe('Selected files');

    host.fileListLabel.set('Fișiere selectate');
    await fixture.whenStable();
    expect(list.getAttribute('aria-label')).toBe('Fișiere selectate');

    // An emptied label drops the attribute instead of naming the list ''.
    host.fileListLabel.set('');
    await fixture.whenStable();
    expect(list.hasAttribute('aria-label')).toBe(false);
  });

  it('leaves list semantics to the native elements, without redundant item roles', async () => {
    const { fixture, host, el } = await render();

    host.files.set([makeFile('a.pdf'), makeFile('b.pdf')]);
    await fixture.whenStable();

    const items = Array.from(el.querySelectorAll('.file-field__list-item'));

    expect(items).toHaveLength(2);
    // `li` inside `ul` is already a listitem — an explicit role adds nothing,
    // measured identical in the Chromium and WebKit accessibility trees.
    expect(items.every((item) => !item.hasAttribute('role'))).toBe(true);
    // The semantics come from the elements themselves, so they must stay li/ul.
    expect(items.every((item) => item.tagName === 'LI')).toBe(true);
    expect(items.every((item) => item.parentElement?.tagName === 'UL')).toBe(true);
  });

  it('hides the built-in list when showFileList is off', async () => {
    const { fixture, host, items } = await render();

    host.files.set([makeFile('a.pdf')]);
    host.showFileList.set(false);
    await fixture.whenStable();

    expect(items()).toHaveLength(0);
  });

  it('marks the browse control invalid via aria-invalid, independent of any message', async () => {
    const { fixture, host, chooseBtn, assistive } = await render();

    expect(chooseBtn()?.getAttribute('aria-invalid')).toBeNull();
    expect(assistive()).toBeNull();

    host.invalid.set(true);
    await fixture.whenStable();

    expect(chooseBtn()?.getAttribute('aria-invalid')).toBe('true');
    // `invalid` alone drives the visuals; it projects no message of its own.
    expect(assistive()).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { chooseBtn, assistive } = await render();

    expect(assistive()).toBeNull();
    expect(chooseBtn()?.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const { fixture, host, chooseBtn, assistive } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = assistive() as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Helper.');
    expect(chooseBtn()?.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper', async () => {
    const { fixture, host, assistive } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();
    host.showHelper.set(false);
    host.showError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = assistive() as HTMLElement;

    expect(wrapper.textContent).toContain('Error.');
    expect(wrapper.textContent).not.toContain('Helper.');
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, assistive } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = assistive()!.querySelectorAll('mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Helper.');
    expect(messages[1].textContent).toContain('Error.');
  });

  it('creates preview URLs for images and revokes them on removal', async () => {
    const created: string[] = [];
    const revoked: string[] = [];
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    URL.createObjectURL = () => {
      const url = `blob:preview-${created.length}`;

      created.push(url);

      return url;
    };
    URL.revokeObjectURL = (url: string) => {
      revoked.push(url);
    };

    try {
      const { fixture, host, native, items } = await render();

      await pick(fixture, native(), [makeFile('photo.png', 4, 'image/png'), makeFile('doc.pdf')]);

      expect(created).toEqual(['blob:preview-0']);
      expect(items()[0].querySelector('.file-item__thumbnail')?.getAttribute('src')).toBe('blob:preview-0');
      expect(items()[1].querySelector('.file-item__thumbnail')).toBeNull();

      (items()[0].querySelector('.file-item__remove') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(revoked).toEqual(['blob:preview-0']);
      expect(host.files().map((file) => file.name)).toEqual(['doc.pdf']);
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('renders on the server without touching object URLs or focus', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const createObjectURL = vi.spyOn(URL, 'createObjectURL');
    const { fixture, host, el, native, dropzone, chooseBtn } = await render();

    // Go through real intake, not an external value assignment: that is the
    // only path that mints previews, so it is the one SSR has to survive.
    await pick(fixture, native(), [makeFile('photo.png', 4, 'image/png')]);

    expect(host.files().map((file) => file.name)).toEqual(['photo.png']);

    // Server-rendered markup must be complete — hydration replays from it.
    expect(dropzone()).not.toBeNull();
    expect(chooseBtn()).not.toBeNull();
    expect(el.querySelectorAll('mud-file-item')).toHaveLength(1);
    expect(el.querySelector('[role="status"]')).not.toBeNull();

    // No image preview is minted server-side: there is nothing to revoke it.
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(el.querySelector('.file-item__thumbnail')).toBeNull();

    // focus() is a no-op rather than a crash.
    fixture.debugElement.children[0].componentInstance.focus();
    expect(document.activeElement).toBe(document.body);

    createObjectURL.mockRestore();
  });

  it('works as a reactive form control', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-file-input') as HTMLElement;
    const native = el.querySelector('.file-field__native') as HTMLInputElement;

    await pick(fixture, native, [makeFile('a.pdf')]);
    expect(host.control.value?.map((file) => file.name)).toEqual(['a.pdf']);

    const browse = el.querySelector('.file-field__browse') as HTMLButtonElement;

    browse.focus();
    browse.blur();
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(browse.disabled).toBe(true);
  });

  it('binds signal forms through [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-file-input') as HTMLElement;
    const native = el.querySelector('.file-field__native') as HTMLInputElement;

    await pick(fixture, native, [makeFile('a.pdf')]);
    expect(host.model().documents.map((file) => file.name)).toEqual(['a.pdf']);

    host.model.set({ documents: [makeFile('x.pdf'), makeFile('y.pdf')] });
    await fixture.whenStable();
    expect(el.querySelectorAll('mud-file-item')).toHaveLength(2);
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const chooseBtn = fixture.nativeElement.querySelector('.file-field__browse') as HTMLButtonElement;

    expect(chooseBtn.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(chooseBtn.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });
});

// The messages `<ng-content select="mud-inline-message" />` is an element
// selector; `mud-file-item`'s `[icon]` slot is an unrelated attribute
// selector on a sibling component's own light DOM. This locks in that a page
// projecting both keeps each in its own place.
describe('MudFileInput alongside a projected mud-file-item icon', () => {
  it('keeps the file-input message and the file-item icon in their own slots', async () => {
    const fixture = TestBed.createComponent(BothProjectionsHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const wrapper = root.querySelector('.input-field__assistive') as HTMLElement;
    const icon = root.querySelector('.custom-icon');

    expect(wrapper.textContent).toContain('Documentul este invalid.');
    expect(icon).not.toBeNull();
    expect(icon?.closest('mud-file-item')).not.toBeNull();
    // The icon never leaks into the file-input's own assistive wrapper.
    expect(wrapper.querySelector('.custom-icon')).toBeNull();
  });
});

@Component({
  imports: [MudFileInput, ReactiveFormsModule],
  template: `<mud-file-input [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<File[]>([], { nonNullable: true });
}

@Component({
  imports: [MudFileInput, FormField],
  template: `<mud-file-input [formField]="form.documents" />`,
})
class SignalHost {
  readonly model = signal({ documents: [] as File[] });
  readonly form = form(this.model);
}

@Component({
  imports: [MudFileInput, MudInlineMessage],
  template: `
    <mud-file-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Helper.</mud-inline-message>
      }
    </mud-file-input>
  `,
})
class ExternalDescribedHost {
  readonly value = signal<File[]>([]);
  readonly showMessage = signal(false);
}

@Component({
  imports: [MudFileInput, MudFileItem, MudInlineMessage],
  template: `
    <mud-file-input invalid>
      <mud-inline-message variant="error">Documentul este invalid.</mud-inline-message>
    </mud-file-input>
    <mud-file-item filename="raport.pdf">
      <svg icon class="custom-icon" viewBox="0 0 20 20"></svg>
    </mud-file-item>
  `,
})
class BothProjectionsHost {}
