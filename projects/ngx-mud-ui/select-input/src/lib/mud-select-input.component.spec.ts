import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudSelectInput } from './mud-select-input.component';
import type { MudSelectOption } from './mud-select-input.component';

const OPTIONS: MudSelectOption<string>[] = [
  { value: 'chisinau', label: 'Chișinău' },
  { value: 'balti', label: 'Bălți' },
  { value: 'cahul', label: 'Cahul', disabled: true },
  { value: 'orhei', label: 'Orhei' },
];

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input
      label="Raion"
      placeholder="Alegeți raionul"
      [options]="options()"
      [(value)]="value"
      [(open)]="open"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [invalid]="invalid()"
      [errorText]="errorText()"
      [helperText]="helperText()"
    />
  `,
})
class Host {
  readonly options = signal(OPTIONS);
  readonly value = signal<string | undefined>(undefined);
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  readonly errorText = signal<string | undefined>(undefined);
  readonly helperText = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;
  const trigger = el.querySelector('.select-field__trigger') as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    trigger,
    panel: () => document.querySelector<HTMLElement>('.menu-panel'),
    optionEls: () => Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')),
  };
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
  await fixture.whenStable();
}

describe('MudSelectInput', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('renders the combobox trigger with the field ARIA wiring', async () => {
    const { el, trigger } = await render();
    const label = el.querySelector('.input-field__label')!;

    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // The listbox only exists while open; a closed trigger must not
    // reference a non-existent id (axe aria-valid-attr-value).
    expect(trigger.getAttribute('aria-controls')).toBeNull();
    expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);
    expect(trigger.textContent).toContain('Alegeți raionul');
    expect(el.querySelector('.select-field__text.is-placeholder')).toBeTruthy();
  });

  it('opens on click, shows the listbox in an overlay, and selects on option click', async () => {
    const { fixture, host, trigger, panel, optionEls } = await render();

    trigger.click();
    await fixture.whenStable();

    expect(host.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
    expect(panel()!.getAttribute('role')).toBe('listbox');
    expect(optionEls()).toHaveLength(4);

    optionEls()[1].click();
    await fixture.whenStable();

    expect(host.value()).toBe('balti');
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
    expect(trigger.textContent).toContain('Bălți');
    expect(document.activeElement).toBe(trigger);
  });

  it('drives the highlight from the trigger via aria-activedescendant, skipping disabled', async () => {
    const { fixture, host, trigger, optionEls } = await render();

    trigger.focus();
    await key(fixture, trigger, 'ArrowDown');
    expect(host.open()).toBe(true);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-0');
    expect(optionEls()[0].classList.contains('is-highlighted')).toBe(true);

    await key(fixture, trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-1');

    // Cahul (index 2) is disabled: the walk skips to Orhei (index 3).
    await key(fixture, trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-3');

    // Clamps at the end (APG combobox: no wrap).
    await key(fixture, trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-3');

    await key(fixture, trigger, 'Home');
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-0');

    await key(fixture, trigger, 'Enter');
    expect(host.value()).toBe('chisinau');
    expect(host.open()).toBe(false);
  });

  it('primes the highlight on the selected option, scrolls it into view on open, and closes on Escape', async () => {
    const { fixture, host, trigger } = await render();
    // jsdom has no scrollIntoView; install one to observe the open-time scroll.
    const scrolled = vi.fn();

    (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = scrolled;

    host.value.set('orhei');
    await fixture.whenStable();

    await key(fixture, trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-opt-3');
    // The selected option was scrolled into view already on open.
    expect(scrolled).toHaveBeenCalled();
    delete (Element.prototype as unknown as { scrollIntoView?: () => void }).scrollIntoView;

    await key(fixture, trigger, 'Escape');
    expect(host.open()).toBe(false);
    expect(host.value()).toBe('orhei');
  });

  it('does not open while disabled or readonly', async () => {
    const { fixture, host, trigger } = await render();

    host.readonly.set(true);
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);

    host.readonly.set(false);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
  });

  it('shows the error region (role=alert) replacing the helper, wired to the trigger', async () => {
    const { fixture, host, el, trigger } = await render();

    host.helperText.set('Raionul de reședință.');
    await fixture.whenStable();

    const helper = el.querySelector('.input-field__assistive')!;

    expect(trigger.getAttribute('aria-describedby')).toContain(helper.id);

    host.invalid.set(true);
    host.errorText.set('Alegeți un raion.');
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('shows the empty state when there are no options', async () => {
    const { fixture, host, trigger, panel } = await render();

    host.options.set([]);
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();

    const empty = panel()!.querySelector('.menu-panel__empty')!;

    expect(empty.textContent).toContain('No options');
    // Listbox children must be options (axe aria-required-children).
    expect(empty.getAttribute('role')).toBe('option');
    expect(empty.getAttribute('aria-disabled')).toBe('true');
  });

  it('works as a reactive form control', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector('.select-field__trigger') as HTMLButtonElement;

    expect(trigger.textContent).toContain('Chișinău');

    trigger.click();
    await fixture.whenStable();
    (document.querySelectorAll('.menu-panel__option')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(host.control.value).toBe('balti');

    trigger.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
  });

  it('binds signal forms through [formField], surfacing validator errors', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;
    const trigger = el.querySelector('.select-field__trigger') as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    (document.querySelectorAll('.menu-panel__option')[0] as HTMLElement).click();
    await fixture.whenStable();
    expect(host.model().raion).toBe('chisinau');

    host.model.set({ raion: '' });
    await fixture.whenStable();
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(el.querySelector('.inline-message--error')?.textContent).toContain('Alegeți un raion');
  });

  it('supports non-string option values via Object.is', async () => {
    const fixture = TestBed.createComponent(NumberHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector('.select-field__trigger') as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    (document.querySelectorAll('.menu-panel__option')[1] as HTMLElement).click();
    await fixture.whenStable();

    expect(host.copies()).toBe(2);
    expect(trigger.textContent).toContain('Două exemplare');
  });
});

@Component({
  imports: [MudSelectInput, ReactiveFormsModule],
  template: `<mud-select-input label="Raion" [options]="options" [formControl]="control" />`,
})
class ReactiveHost {
  readonly options = OPTIONS;
  readonly control = new FormControl('chisinau', { nonNullable: true });
}

@Component({
  imports: [MudSelectInput, FormField],
  template: `<mud-select-input label="Raion" [options]="options" [formField]="form.raion" />`,
})
class SignalHost {
  readonly options = OPTIONS;
  readonly model = signal({ raion: '' });
  readonly form = form(this.model, (path) => {
    required(path.raion, { message: 'Alegeți un raion.' });
  });
}

@Component({
  imports: [MudSelectInput],
  template: `<mud-select-input label="Exemplare" [options]="options" [(value)]="copies" />`,
})
class NumberHost {
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}
