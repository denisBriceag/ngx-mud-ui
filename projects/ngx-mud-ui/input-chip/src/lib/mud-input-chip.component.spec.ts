import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudInputChip } from './mud-input-chip.component';
import type { MudInputChipError } from './mud-input-chip.component';

@Component({
  imports: [MudInputChip],
  template: `
    <mud-input-chip
      label="Destinatari"
      placeholder="nume@exemplu.md"
      [(value)]="chips"
      [(draft)]="draft"
      [maxChips]="maxChips()"
      [validatePattern]="validatePattern()"
      [separators]="separators()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      (chipAdded)="added.push($event.chip)"
      (chipRemoved)="removed.push($event.chip)"
      (errored)="errors.push($event)"
    />
  `,
})
class Host {
  readonly chips = signal<string[]>([]);
  readonly draft = signal('');
  readonly maxChips = signal<number | undefined>(undefined);
  readonly validatePattern = signal<RegExp | undefined>(undefined);
  readonly separators = signal(',');
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly added: string[] = [];
  readonly removed: string[] = [];
  readonly errors: MudInputChipError[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-input-chip') as HTMLElement;
  const native = el.querySelector('.chip-field__native') as HTMLInputElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    native,
    chipEls: () => Array.from(el.querySelectorAll<HTMLElement>('.chip-field__chip')),
    removeBtns: () => Array.from(el.querySelectorAll<HTMLButtonElement>('.chip-field__chip-remove')),
    live: () => el.querySelector('[role="status"]') as HTMLElement,
  };
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
  await fixture.whenStable();
}

async function paste(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true });

  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
  native.dispatchEvent(event);
  await fixture.whenStable();
}

describe('MudInputChip', () => {
  it('renders the labelled group with a placeholder only while empty', async () => {
    const { fixture, host, el, native, chipEls } = await render();
    const group = el.querySelector('.chip-field__control')!;
    const label = el.querySelector('.input-field__label')!;

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    expect(native.getAttribute('placeholder')).toBe('nume@exemplu.md');

    host.chips.set(['ana@exemplu.md']);
    await fixture.whenStable();

    expect(chipEls()).toHaveLength(1);
    expect(chipEls()[0].textContent).toContain('ana@exemplu.md');
    expect(native.getAttribute('placeholder')).toBeNull();
  });

  it('confirms a chip on Enter and on separator keys, clearing the draft', async () => {
    const { fixture, host, native, live } = await render();

    native.focus();
    await type(fixture, native, 'ana@exemplu.md');
    await key(fixture, native, 'Enter');

    expect(host.chips()).toEqual(['ana@exemplu.md']);
    expect(host.draft()).toBe('');
    expect(native.value).toBe('');
    expect(host.added).toEqual(['ana@exemplu.md']);
    expect(live().textContent).toContain('ana@exemplu.md added');

    await type(fixture, native, 'ion@exemplu.md');
    const separator = new KeyboardEvent('keydown', { key: ',', bubbles: true, cancelable: true });

    native.dispatchEvent(separator);
    await fixture.whenStable();

    expect(separator.defaultPrevented).toBe(true);
    expect(host.chips()).toEqual(['ana@exemplu.md', 'ion@exemplu.md']);
  });

  it('removes the last chip with Backspace on an empty draft and lands focus predictably', async () => {
    const { fixture, host, native, removeBtns, live } = await render();

    host.chips.set(['a', 'b', 'c']);
    await fixture.whenStable();

    native.focus();
    await key(fixture, native, 'Backspace');
    expect(host.chips()).toEqual(['a', 'b']);
    expect(host.removed).toEqual(['c']);
    expect(live().textContent).toContain('c removed');
    // The new last chip's remove button takes focus.
    expect(document.activeElement).toBe(removeBtns()[1]);

    // Removing a middle chip keeps focus at the same index.
    removeBtns()[0].click();
    await fixture.whenStable();
    expect(host.chips()).toEqual(['b']);
    expect(document.activeElement).toBe(removeBtns()[0]);

    // Removing the only chip returns focus to the input.
    await key(fixture, removeBtns()[0], 'Delete');
    expect(host.chips()).toEqual([]);
    expect(document.activeElement).toBe(native);
  });

  it('walks between the input and chips with arrow keys', async () => {
    const { fixture, host, native, removeBtns } = await render();

    host.chips.set(['a', 'b']);
    await fixture.whenStable();

    native.focus();
    await key(fixture, native, 'ArrowLeft');
    expect(document.activeElement).toBe(removeBtns()[1]);

    await key(fixture, removeBtns()[1], 'ArrowLeft');
    expect(document.activeElement).toBe(removeBtns()[0]);

    await key(fixture, removeBtns()[0], 'ArrowRight');
    expect(document.activeElement).toBe(removeBtns()[1]);

    await key(fixture, removeBtns()[1], 'ArrowRight');
    expect(document.activeElement).toBe(native);
  });

  it('rejects duplicates, pattern mismatches, and additions past maxChips', async () => {
    const { fixture, host, native, live } = await render();

    host.chips.set(['ana@exemplu.md']);
    host.validatePattern.set(/^[^@\s]+@[^@\s]+$/);
    host.maxChips.set(2);
    await fixture.whenStable();

    await type(fixture, native, 'ana@exemplu.md');
    await key(fixture, native, 'Enter');
    expect(host.errors.at(-1)).toEqual({ code: 'duplicate', value: 'ana@exemplu.md' });
    expect(live().textContent).toContain('already added');

    // Rejecting the same value again must still mutate the live region
    // (an unchanged DOM would never re-announce).
    const firstAnnouncement = live().textContent;

    await type(fixture, native, 'ana@exemplu.md');
    await key(fixture, native, 'Enter');
    expect(host.errors).toHaveLength(2);
    expect(live().textContent).not.toBe(firstAnnouncement);
    expect(live().textContent).toContain('already added');

    await type(fixture, native, 'not-an-email');
    await key(fixture, native, 'Enter');
    expect(host.errors.at(-1)).toEqual({ code: 'pattern', value: 'not-an-email' });
    expect(host.chips()).toEqual(['ana@exemplu.md']);

    await type(fixture, native, 'ion@exemplu.md');
    await key(fixture, native, 'Enter');
    expect(host.chips()).toEqual(['ana@exemplu.md', 'ion@exemplu.md']);
    // Max reached: the input turns readonly (still focusable so Backspace
    // keeps working) and further adds are rejected.
    expect(native.readOnly).toBe(true);

    // …but a leftover draft stays editable so it can't get trapped.
    await type(fixture, native, 'leftover');
    expect(native.readOnly).toBe(false);
    await type(fixture, native, '');
    expect(native.readOnly).toBe(true);

    host.chips.set(['ana@exemplu.md']);
    host.maxChips.set(1);
    await fixture.whenStable();
    await paste(fixture, native, 'x@y.md, z@w.md');
    expect(host.errors.at(-1)?.code).toBe('max');
    expect(host.chips()).toEqual(['ana@exemplu.md']);
  });

  it('splits multi-token pastes on separators and newlines', async () => {
    const { fixture, host, native } = await render();

    const event = new Event('paste', { bubbles: true, cancelable: true });

    Object.defineProperty(event, 'clipboardData', { value: { getData: () => 'a@b.md, c@d.md\ne@f.md' } });
    native.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(host.chips()).toEqual(['a@b.md', 'c@d.md', 'e@f.md']);

    // A single token without separators stays native typing.
    const single = new Event('paste', { bubbles: true, cancelable: true });

    Object.defineProperty(single, 'clipboardData', { value: { getData: () => 'plain' } });
    native.dispatchEvent(single);
    await fixture.whenStable();
    expect(single.defaultPrevented).toBe(false);
  });

  it('ignores mutations while readonly or disabled', async () => {
    const { fixture, host, native, removeBtns } = await render();

    host.chips.set(['a']);
    host.readonly.set(true);
    await fixture.whenStable();

    native.focus();
    await key(fixture, native, 'Backspace');
    removeBtns()[0].click();
    await fixture.whenStable();
    expect(host.chips()).toEqual(['a']);

    host.readonly.set(false);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
    expect(removeBtns()[0].disabled).toBe(true);
  });

  it('works as a reactive form control with array values', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('.chip-field__native') as HTMLInputElement;

    expect(fixture.nativeElement.querySelectorAll('.chip-field__chip')).toHaveLength(1);

    native.focus();
    native.value = 'ion@exemplu.md';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.control.value).toEqual(['ana@exemplu.md', 'ion@exemplu.md']);

    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('.chip-field__native') as HTMLInputElement;

    native.focus();
    native.value = 'ana@exemplu.md';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.model().recipients).toEqual(['ana@exemplu.md']);

    host.model.set({ recipients: ['x@y.md', 'z@w.md'] });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.chip-field__chip')).toHaveLength(2);
  });
});

@Component({
  imports: [MudInputChip, ReactiveFormsModule],
  template: `<mud-input-chip label="Destinatari" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string[]>(['ana@exemplu.md'], { nonNullable: true });
}

@Component({
  imports: [MudInputChip, FormField],
  template: `<mud-input-chip label="Destinatari" [formField]="form.recipients" />`,
})
class SignalHost {
  readonly model = signal({ recipients: [] as string[] });
  readonly form = form(this.model);
}
