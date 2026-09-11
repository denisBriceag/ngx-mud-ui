import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudSearchInput } from './mud-search-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudSearchInputShape } from './mud-search-input.component';

@Component({
  imports: [MudSearchInput, MudLabel, MudInlineMessage],
  template: `
    <mud-search-input
      [(value)]="value"
      [shape]="shape()"
      [invalid]="invalid()"
      [clearable]="clearable()"
      [withButton]="withButton()"
      [loading]="loading()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      (searched)="searches.push($event)"
      (cleared)="clears = clears + 1"
    >
      @if (withLabel()) {
        <mud-label>Căutare</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Introduceți minim 3 caractere.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Rezultat inexistent.</mud-inline-message>
      }
    </mud-search-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly shape = signal<MudSearchInputShape>('rectangular');
  readonly invalid = signal(false);
  readonly clearable = signal(true);
  readonly withButton = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
  readonly searches: string[] = [];
  clears = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-search-input') as HTMLElement;
  const native = el.querySelector('input') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudSearchInput', () => {
  it('renders the field anatomy with a type=search input and the built-in glyph', async () => {
    const { el, native } = await render();

    expect(el.classList.contains('input-field')).toBe(true);
    expect(native.type).toBe('search');
    expect(el.querySelector('.input-field__affix--start svg')).toBeTruthy();
    expect(el.classList.contains('input-field--circular')).toBe(false);
  });

  it('maps the circular shape to its modifier class', async () => {
    const { fixture, host, el } = await render();

    host.shape.set('circular');
    await fixture.whenStable();
    expect(el.classList.contains('input-field--circular')).toBe(true);
  });

  it('emits search with the current value on Enter', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native, 'pașaport');
    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(host.searches).toEqual(['pașaport']);
  });

  it('renders the submit button with withButton and emits search on click', async () => {
    const { fixture, host, el, native } = await render();

    expect(el.querySelector('.input-field__submit')).toBeNull();

    host.withButton.set(true);
    await fixture.whenStable();

    await type(fixture, native, 'buletin');
    (el.querySelector('.input-field__submit') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(host.searches).toEqual(['buletin']);
  });

  it('clear is on by default: empties, emits cleared, and refocuses', async () => {
    const { fixture, host, el, native } = await render();

    expect(el.querySelector('.input-field__search-clear')).toBeNull();

    await type(fixture, native, 'ceva');
    const clear = el.querySelector('.input-field__search-clear') as HTMLButtonElement;

    expect(clear).toBeTruthy();
    expect(clear.tabIndex).toBe(-1);

    clear.click();
    await fixture.whenStable();

    expect(host.value()).toBe('');
    expect(host.clears).toBe(1);
    expect(document.activeElement).toBe(native);
  });

  it('suppresses clear, Enter, and the submit action while inert', async () => {
    const { fixture, host, el, native } = await render();

    host.withButton.set(true);
    await type(fixture, native, 'ceva');

    host.loading.set(true);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__search-clear')).toBeNull();
    expect(el.querySelector('.input-field__spinner')).toBeTruthy();
    expect((el.querySelector('.input-field__submit') as HTMLButtonElement).disabled).toBe(true);

    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();
    expect(host.searches).toEqual([]);
  });

  it('uses aria-label only when no visible label exists', async () => {
    const fixture = TestBed.createComponent(UnlabelledHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-label')).toBe('Search services');
    expect(native.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders the projected mud-label inside the field label element', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.textContent).toContain('Căutare');
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders no label element without a projected mud-label; ariaLabel takes over', async () => {
    const { fixture, host, el, native } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__label')).toBeNull();
    expect(native.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { el, native } = await render();

    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Introduceți minim 3 caractere.');
    expect(native.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();
    host.showHelper.set(false);
    host.showError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('Rezultat inexistent.');
    expect(wrapper.textContent).not.toContain('Introduceți minim 3 caractere.');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Introduceți minim 3 caractere.');
    expect(messages[1].textContent).toContain('Rezultat inexistent.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });

  it('works as a reactive form control', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    await type(fixture, native, 'căutare');
    expect(host.control.value).toBe('căutare');

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    await type(fixture, native, 'mpay');
    expect(host.model().query).toBe('mpay');
  });
});

@Component({
  imports: [MudSearchInput],
  template: `<mud-search-input aria-label="Search services" />`,
})
class UnlabelledHost {}

@Component({
  imports: [MudSearchInput, ReactiveFormsModule],
  template: `<mud-search-input [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl('', { nonNullable: true });
}

@Component({
  imports: [MudSearchInput, FormField],
  template: `<mud-search-input [formField]="form.query" />`,
})
class SignalHost {
  readonly model = signal({ query: '' });
  readonly form = form(this.model);
}

@Component({
  imports: [MudSearchInput, MudInlineMessage],
  template: `
    <mud-search-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Introduceți minim 3 caractere.</mud-inline-message>
      }
    </mud-search-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal('');
  readonly showMessage = signal(false);
}
