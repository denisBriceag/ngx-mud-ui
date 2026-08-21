import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudSearchInput } from './mud-search-input.component';
import type { MudSearchInputShape } from './mud-search-input.component';

@Component({
  imports: [MudSearchInput],
  template: `
    <mud-search-input
      label="Căutare"
      [(value)]="value"
      [shape]="shape()"
      [clearable]="clearable()"
      [withButton]="withButton()"
      [loading]="loading()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      (searched)="searches.push($event)"
      (cleared)="clears = clears + 1"
    />
  `,
})
class Host {
  readonly value = signal('');
  readonly shape = signal<MudSearchInputShape>('rectangular');
  readonly clearable = signal(true);
  readonly withButton = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
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
  imports: [MudSearchInput, ReactiveFormsModule],
  template: `<mud-search-input label="Căutare" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl('', { nonNullable: true });
}

@Component({
  imports: [MudSearchInput, FormField],
  template: `<mud-search-input label="Căutare" [formField]="form.query" />`,
})
class SignalHost {
  readonly model = signal({ query: '' });
  readonly form = form(this.model);
}
