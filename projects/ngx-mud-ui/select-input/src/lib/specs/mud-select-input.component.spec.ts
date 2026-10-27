import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudSelectInput } from '../mud-select-input.component';
import { MudLabel } from '../../../../label/src/public-api';
import { MudInlineMessage } from '../../../../inline-message/src/public-api';
import { mudSelectDefaultFilter } from '../mud-select-options';
import type { MudSelectFilter, MudSelectItem, MudSelectOption } from '../mud-select-options';

const OPTIONS: MudSelectOption<string>[] = [
  { value: 'chisinau', label: 'Chișinău' },
  { value: 'balti', label: 'Bălți' },
  { value: 'cahul', label: 'Cahul', disabled: true },
  { value: 'orhei', label: 'Orhei' },
];

@Component({
  imports: [MudSelectInput, MudLabel, MudInlineMessage],
  template: `
    <mud-select-input
      placeholder="Alegeți raionul"
      [options]="options()"
      [(value)]="value"
      [(open)]="open"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [invalid]="invalid()"
    >
      @if (withLabel()) {
        <mud-label>Raion</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Raionul de reședință.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
      }
    </mud-select-input>
  `,
})
class Host {
  readonly options = signal(OPTIONS);
  readonly value = signal<string | undefined>(undefined);
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
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

async function key(
  fixture: { whenStable(): Promise<unknown> },
  target: HTMLElement,
  keyName: string,
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }),
  );
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
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;

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
  });

  it('supports non-string option values via Object.is', async () => {
    const fixture = TestBed.createComponent(NumberHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    (document.querySelectorAll('.menu-panel__option')[1] as HTMLElement).click();
    await fixture.whenStable();

    expect(host.copies()).toBe(2);
    expect(trigger.textContent).toContain('Două exemplare');
  });

  it('uses aria-label only when no visible label exists', async () => {
    const fixture = TestBed.createComponent(UnlabelledHost);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toBe('Alege un raion');
    expect(trigger.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no label element without a projected mud-label', async () => {
    const { fixture, host, el, trigger } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__label')).toBeNull();
    expect(trigger.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { el, trigger } = await render();

    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const { fixture, host, el, trigger } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain(
      'Raionul de reședință.',
    );
    expect(trigger.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper, wired to the trigger', async () => {
    const { fixture, host, el, trigger } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();
    host.showHelper.set(false);
    host.showError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.textContent).toContain('Alegeți un raion.');
    expect(wrapper.textContent).not.toContain('Raionul de reședință.');
    expect(trigger.getAttribute('aria-describedby')).toContain(wrapper.id);
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Raionul de reședință.');
    expect(messages[1].textContent).toContain('Alegeți un raion.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(trigger.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });
});

@Component({
  imports: [MudSelectInput, ReactiveFormsModule, MudLabel],
  template: `
    <mud-select-input [options]="options" [formControl]="control">
      <mud-label>Raion</mud-label>
    </mud-select-input>
  `,
})
class ReactiveHost {
  readonly options = OPTIONS;
  readonly control = new FormControl('chisinau', { nonNullable: true });
}

@Component({
  imports: [MudSelectInput, FormField, MudLabel],
  template: `
    <mud-select-input [options]="options" [formField]="form.raion">
      <mud-label>Raion</mud-label>
    </mud-select-input>
  `,
})
class SignalHost {
  readonly options = OPTIONS;
  readonly model = signal({ raion: '' });
  readonly form = form(this.model, (path) => {
    required(path.raion, { message: 'Alegeți un raion.' });
  });
}

@Component({
  imports: [MudSelectInput, MudLabel],
  template: `
    <mud-select-input [options]="options" [(value)]="copies">
      <mud-label>Exemplare</mud-label>
    </mud-select-input>
  `,
})
class NumberHost {
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}

@Component({
  imports: [MudSelectInput],
  template: `<mud-select-input aria-label="Alege un raion" [options]="options" />`,
})
class UnlabelledHost {
  readonly options = OPTIONS;
}

@Component({
  imports: [MudSelectInput, MudInlineMessage],
  template: `
    <mud-select-input aria-describedby="extra-id" [options]="options" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Raionul de reședință.</mud-inline-message>
      }
    </mud-select-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly options = OPTIONS;
  readonly value = signal<string | undefined>(undefined);
  readonly showMessage = signal(false);
}

describe('MudSelectInput orphan value diagnostics', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('warns when the value matches no option, naming the value', async () => {
    const { fixture, host } = await render();

    host.value.set('no-such-raion');
    await fixture.whenStable();

    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.flat().join(' ')).toContain('no-such-raion');
  });

  it('stays quiet while options are still empty, so an async load is not flagged', async () => {
    const { fixture, host } = await render();

    host.options.set([]);
    host.value.set('arrives-later');
    await fixture.whenStable();

    expect(warn).not.toHaveBeenCalled();

    // Once the options land WITHOUT it, that is a genuine mismatch.
    host.options.set(OPTIONS);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalled();
  });

  it('says nothing for a matching value or an empty one', async () => {
    const { fixture, host } = await render();

    host.value.set('balti');
    await fixture.whenStable();
    expect(warn).not.toHaveBeenCalled();

    host.value.set(undefined);
    await fixture.whenStable();
    expect(warn).not.toHaveBeenCalled();
  });
});

interface Raion {
  id: number;
}

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input
      placeholder="Alegeți raionul"
      [options]="options"
      [compareWith]="compareWith()"
      [(value)]="value"
      [(open)]="open"
    />
  `,
})
class CompareHost {
  readonly options: MudSelectOption<Raion>[] = [
    { value: { id: 1 }, label: 'A' },
    { value: { id: 2 }, label: 'B' },
  ];
  readonly compareWith = signal<(a: Raion, b: Raion) => boolean>((a, b) => a.id === b.id);
  readonly value = signal<Raion | undefined>(undefined);
  readonly open = signal(false);
}

describe('MudSelectInput compareWith', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
    vi.restoreAllMocks();
  });

  async function renderCompare() {
    const fixture = TestBed.createComponent(CompareHost);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;

    return { fixture, host: fixture.componentInstance, trigger };
  }

  it('selects by compareWith: a fresh object with the same id shows as selected', async () => {
    const { fixture, host, trigger } = await renderCompare();

    host.value.set({ id: 2 });
    await fixture.whenStable();
    expect(trigger.textContent).toContain('B');

    trigger.click();
    await fixture.whenStable();
    const second = document.querySelectorAll<HTMLElement>('.menu-panel__option')[1];

    expect(second.getAttribute('aria-selected')).toBe('true');
    expect(second.classList.contains('is-highlighted')).toBe(true);
  });

  it('never calls compareWith with an undefined value', async () => {
    const { fixture, host, trigger } = await renderCompare();
    const spy = vi.fn((a: Raion, b: Raion) => a.id === b.id);

    host.compareWith.set(spy);
    await fixture.whenStable();
    host.open.set(true);
    await fixture.whenStable();
    host.open.set(false);
    await fixture.whenStable();

    expect(trigger.textContent).toContain('Alegeți raionul');
    expect(spy).not.toHaveBeenCalled();

    // Positive control: a real value does go through the comparer.
    host.value.set({ id: 1 });
    await fixture.whenStable();
    expect(spy).toHaveBeenCalled();
    expect(trigger.textContent).toContain('A');
  });

  it('the unmatched-value warning uses compareWith', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, host } = await renderCompare();

    host.value.set({ id: 1 });
    await fixture.whenStable();

    expect(warn).not.toHaveBeenCalled();
  });
});

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input
      placeholder="Alegeți raionul"
      [options]="options"
      [(value)]="value"
      [(open)]="open"
    />
  `,
})
class NullOptionHost {
  readonly options: MudSelectOption<string | null>[] = [
    { value: null, label: 'Toate' },
    { value: 'balti', label: 'Bălți' },
  ];
  readonly value = signal<string | null | undefined>(null);
  readonly open = signal(false);
}

// Baseline behaviour (Object.is): an option whose value is null is a real, selectable choice.
// null is signal forms' usual "nothing" default, so an "All" option must keep working.
describe('MudSelectInput empty-valued option', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('shows a null-valued option as selected when the value is null, and selects it by click', async () => {
    const fixture = TestBed.createComponent(NullOptionHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector(
      '.select-field__trigger',
    ) as HTMLButtonElement;
    const optionEls = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option'));

    expect(trigger.textContent).toContain('Toate');

    trigger.click();
    await fixture.whenStable();
    expect(optionEls()[0].getAttribute('aria-selected')).toBe('true');
    expect(optionEls()[0].querySelector('.menu-panel__option-check')).toBeTruthy();

    optionEls()[1].click();
    await fixture.whenStable();
    expect(host.value()).toBe('balti');

    trigger.click();
    await fixture.whenStable();
    optionEls()[0].click();
    await fixture.whenStable();
    expect(host.value()).toBeNull();
    expect(trigger.textContent).toContain('Toate');

    // An empty value never triggers the unmatched-value warning.
    host.value.set(undefined);
    await fixture.whenStable();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('MudSelectInput groups', () => {
  const GROUPED: MudSelectItem<string>[] = [
    {
      label: 'Nord',
      options: [
        { value: 'balti', label: 'Bălți' },
        { value: 'soroca', label: 'Soroca' },
      ],
    },
    { label: 'Sud', options: [{ value: 'cahul', label: 'Cahul' }] },
  ];

  it('renders groups as role=group named by their heading', async () => {
    const { fixture, host, trigger } = await render();

    host.options.set(GROUPED as MudSelectOption<string>[]);
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();

    const group = document.querySelector<HTMLElement>('.menu-panel__group')!;
    const heading = group.querySelector<HTMLElement>('.menu-panel__group-heading')!;

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.textContent?.trim()).toBe('Nord');
    expect(heading.getAttribute('role')).toBe('presentation');
  });

  it('arrow keys walk options across groups and skip headings', async () => {
    const { fixture, host, trigger } = await render();

    host.options.set(GROUPED as MudSelectOption<string>[]);
    await fixture.whenStable();
    await key(fixture, trigger, 'ArrowDown');
    await key(fixture, trigger, 'ArrowDown');
    await key(fixture, trigger, 'ArrowDown');

    const listbox = document.querySelector('.menu-panel')!.id;

    expect(trigger.getAttribute('aria-activedescendant')).toBe(`${listbox}-opt-2`);
    expect(document.getElementById(`${listbox}-opt-2`)?.textContent).toContain('Cahul');
  });

  it('a plain array still renders exactly as before', async () => {
    const { fixture, trigger } = await render();

    trigger.click();
    await fixture.whenStable();

    expect(document.querySelector('.menu-panel__group')).toBeNull();
  });
});

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input [options]="options" [(open)]="open" [disabled]="disabled()" [readonly]="readonly()">
      <svg icon-start class="probe" viewBox="0 0 20 20"></svg>
    </mud-select-input>
  `,
})
class IconHost {
  readonly options = OPTIONS;
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly open = signal(false);
}

describe('MudSelectInput start icon', () => {
  async function renderIcon() {
    const fixture = TestBed.createComponent(IconHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;

    return { fixture, host: fixture.componentInstance, el };
  }

  it('projects an icon-start element before the trigger text', async () => {
    const { el } = await renderIcon();
    const affix = el.querySelector('.input-field__affix--start') as HTMLElement;
    const trigger = el.querySelector('.select-field__trigger') as HTMLElement;

    expect(affix.querySelector('svg.probe')).not.toBeNull();
    expect(affix.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('clicking the start icon opens the panel once, and a second click closes it', async () => {
    const { fixture, host, el } = await renderIcon();
    const icon = el.querySelector('svg.probe') as SVGElement;

    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(host.open()).toBe(true);

    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(host.open()).toBe(false);
  });

  it('focuses the trigger when the start icon is clicked', async () => {
    const { fixture, el } = await renderIcon();
    const icon = el.querySelector('svg.probe') as SVGElement;

    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(el.querySelector('.select-field__trigger'));
  });

  it('ignores start icon clicks when disabled or readonly', async () => {
    const { fixture, host, el } = await renderIcon();
    const icon = el.querySelector('svg.probe') as SVGElement;

    for (const flag of [host.disabled, host.readonly]) {
      flag.set(true);
      await fixture.whenStable();
      icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await fixture.whenStable();
      expect(host.open()).toBe(false);
      flag.set(false);
      await fixture.whenStable();
    }
  });
});

describe('MudSelectInput type-to-jump', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  const highlighted = (trigger: HTMLElement) => trigger.getAttribute('aria-activedescendant') ?? '';

  it('typing jumps to the first enabled option starting with the letters, ignoring diacritics', async () => {
    const { fixture, host, trigger, optionEls } = await render();

    trigger.focus();
    await key(fixture, trigger, 'b');

    expect(host.open()).toBe(true);
    expect(optionEls()[1].classList.contains('is-highlighted')).toBe(true);
    expect(optionEls()[1].textContent).toContain('Bălți');
  });

  it('letters typed within 500ms build one prefix; after a pause a new one starts', async () => {
    const { fixture, trigger } = await render();

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      trigger.focus();
      await key(fixture, trigger, 'c');
      expect(highlighted(trigger)).toContain('-opt-0');
      await key(fixture, trigger, 'h');
      expect(highlighted(trigger)).toContain('-opt-0');

      // "o" after the pause starts a new prefix; "ch"+"o" would match nothing.
      vi.advanceTimersByTime(501);
      await key(fixture, trigger, 'o');
      expect(highlighted(trigger)).toContain('-opt-3');

      // Within the window "o"+"r" extends the prefix.
      await key(fixture, trigger, 'r');
      expect(highlighted(trigger)).toContain('-opt-3');
      vi.advanceTimersByTime(501);
      await key(fixture, trigger, 'b');
      expect(highlighted(trigger)).toContain('-opt-1');
    } finally {
      vi.useRealTimers();
    }
  });

  it('skips disabled options', async () => {
    const { fixture, host, trigger } = await render();

    trigger.focus();
    await key(fixture, trigger, 'c');
    expect(host.open()).toBe(true);
    // Only "Chișinău" (index 0, the primed highlight) matches; Cahul is disabled.
    await key(fixture, trigger, 'a');
    expect(highlighted(trigger)).toContain('-opt-0');
  });

  it('does nothing when no option matches', async () => {
    const { fixture, host, trigger } = await render();

    trigger.focus();
    await key(fixture, trigger, 'z');

    expect(host.open()).toBe(false);
  });

  it('Space still opens the panel when nothing has been typed', async () => {
    const { fixture, host, trigger } = await render();

    trigger.focus();
    await key(fixture, trigger, ' ');

    expect(host.open()).toBe(true);
  });

  it('Space continues the buffer while one is active', async () => {
    const { fixture, host, trigger } = await render();

    host.options.set([
      { value: 'a', label: 'Aaa' },
      { value: 'b', label: 'Ștefan Vodă' },
    ]);
    await fixture.whenStable();
    trigger.focus();
    await key(fixture, trigger, 's');
    for (const k of ['t', 'e', 'f', 'a', 'n', ' ', 'v']) await key(fixture, trigger, k);

    expect(host.open()).toBe(true);
    expect(host.value()).toBeUndefined();
    expect(highlighted(trigger)).toContain('-opt-1');
  });

  it('repeating one letter cycles through the options that start with it', async () => {
    const { fixture, host, trigger } = await render();

    host.options.set([
      { value: 'a', label: 'Bălți' },
      { value: 'b', label: 'Briceni' },
      { value: 'c', label: 'Cahul' },
    ]);
    await fixture.whenStable();
    trigger.focus();
    await key(fixture, trigger, 'b');
    expect(highlighted(trigger)).toContain('-opt-0');
    await key(fixture, trigger, 'b');
    expect(highlighted(trigger)).toContain('-opt-1');
    await key(fixture, trigger, 'b');
    expect(highlighted(trigger)).toContain('-opt-0');
  });

  it('ignores modified keys', async () => {
    const { fixture, host, trigger } = await render();

    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(host.open()).toBe(false);
  });
});

@Component({
  imports: [MudSelectInput, MudLabel],
  template: `
    <mud-select-input
      searchable
      placeholder="Alegeți raionul"
      [options]="options()"
      [filterWith]="filterWith()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [(value)]="value"
      [(open)]="open"
      [(query)]="query"
    >
      <mud-label>Raion</mud-label>
    </mud-select-input>
    <button type="button" class="elsewhere">Elsewhere</button>
  `,
})
class SearchHost {
  readonly options = signal<readonly MudSelectItem<string>[]>(OPTIONS);
  readonly filterWith = signal<MudSelectFilter<string> | null>(mudSelectDefaultFilter);
  readonly value = signal<string | undefined>(undefined);
  readonly open = signal(false);
  readonly query = signal('');
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

describe('MudSelectInput searchable', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  async function renderSearch() {
    const fixture = TestBed.createComponent(SearchHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;
    const input = el.querySelector('input.select-field__trigger') as HTMLInputElement;

    return {
      fixture,
      host: fixture.componentInstance,
      el,
      input,
      optionEls: () => Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')),
      emptyEl: () => document.querySelector<HTMLElement>('.menu-panel__empty'),
    };
  }

  // jsdom has no text editing: set the value and fire the input event a keystroke would.
  async function type(
    fixture: { whenStable(): Promise<unknown> },
    input: HTMLInputElement,
    text: string,
  ) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  const activeLabel = (input: HTMLInputElement) => {
    const id = input.getAttribute('aria-activedescendant');

    return id ? document.getElementById(id)?.textContent?.trim() : null;
  };

  it('renders an input combobox with list autocomplete when searchable', async () => {
    const { el, input } = await renderSearch();

    expect(el.querySelector('input[role=combobox][aria-autocomplete=list]')).toBe(input);
    expect(el.querySelector('button.select-field__trigger')).toBeNull();
    expect(input.type).toBe('text');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-labelledby')).toBe(el.querySelector('.input-field__label')!.id);
    // The chevron sits beside the input (an input cannot hold children).
    expect(el.querySelector('.select-field__chevron')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the selected label while closed, and an empty query with the label as placeholder while open', async () => {
    const { fixture, host, input } = await renderSearch();

    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Alegeți raionul');

    input.click();
    await fixture.whenStable();
    // Nothing selected: the open placeholder falls back to `placeholder`.
    expect(input.placeholder).toBe('Alegeți raionul');
    await key(fixture, input, 'Escape');

    host.value.set('balti');
    await fixture.whenStable();
    expect(input.value).toBe('Bălți');

    input.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Bălți');

    await key(fixture, input, 'Escape');
    expect(input.value).toBe('Bălți');
    expect(input.placeholder).toBe('Alegeți raionul');
  });

  it('typing opens, filters ignoring diacritics, updates query, and highlights the first match', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    input.focus();
    await type(fixture, input, 'balti');

    expect(host.open()).toBe(true);
    expect(host.query()).toBe('balti');
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(['Bălți']);
    expect(optionEls()[0].classList.contains('is-highlighted')).toBe(true);
    expect(activeLabel(input)).toBe('Bălți');
  });

  it('a printable key on a closed field clears the shown label so it starts the query', async () => {
    const { fixture, host, input } = await renderSearch();

    host.value.set('balti');
    await fixture.whenStable();

    const event = new KeyboardEvent('keydown', { key: 'o', bubbles: true, cancelable: true });

    input.dispatchEvent(event);
    expect(input.value).toBe('');
    // The browser's own insertion is not intercepted.
    expect(event.defaultPrevented).toBe(false);
    // Opened at once, so the cleared DOM agrees with the empty-query binding.
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(input.placeholder).toBe('Bălți');
  });

  it('a paste that inserts nothing leaves an open, empty field, and closing restores the label', async () => {
    const { fixture, host, input } = await renderSearch();

    host.value.set('balti');
    await fixture.whenStable();

    // No input event follows: the clipboard was empty.
    input.dispatchEvent(new Event('paste', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.open()).toBe(true);
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Bălți');

    await key(fixture, input, 'Escape');
    expect(input.value).toBe('Bălți');
  });

  it('losing focus closes the panel and clears the query', async () => {
    const { fixture, host, input } = await renderSearch();

    input.focus();
    await type(fixture, input, 'orh');
    expect(host.open()).toBe(true);

    (fixture.nativeElement.querySelector('.elsewhere') as HTMLButtonElement).focus();
    await fixture.whenStable();

    expect(host.open()).toBe(false);
    expect(host.query()).toBe('');
    expect(host.value()).toBeUndefined();
  });

  it('hides a group whose options all fail the query', async () => {
    const { fixture, host, input } = await renderSearch();

    host.options.set([
      { label: 'Nord', options: [{ value: 'balti', label: 'Bălți' }] },
      { label: 'Sud', options: [{ value: 'cahul', label: 'Cahul' }] },
    ]);
    await fixture.whenStable();
    await type(fixture, input, 'cah');

    const headings = Array.from(document.querySelectorAll('.menu-panel__group-heading'));

    expect(headings.map((h) => h.textContent?.trim())).toEqual(['Sud']);
  });

  it('shows noResultsText when nothing matches', async () => {
    const { fixture, input, optionEls, emptyEl } = await renderSearch();

    await type(fixture, input, 'zzz');

    expect(optionEls()).toHaveLength(0);
    expect(emptyEl()?.textContent?.trim()).toBe('No results');
    expect(emptyEl()?.getAttribute('role')).toBe('option');
    expect(emptyEl()?.getAttribute('aria-disabled')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('shows emptyText, not noResultsText, when there are no options and no query', async () => {
    const { fixture, host, input, emptyEl } = await renderSearch();

    host.options.set([]);
    await fixture.whenStable();
    input.click();
    await fixture.whenStable();

    expect(emptyEl()?.textContent?.trim()).toBe('No options');
  });

  it('Enter selects, clears the query and closes; focus stays in the input', async () => {
    const { fixture, host, input } = await renderSearch();

    input.focus();
    await type(fixture, input, 'orh');
    await key(fixture, input, 'Enter');

    expect(host.value()).toBe('orhei');
    expect(host.query()).toBe('');
    expect(host.open()).toBe(false);
    expect(input.value).toBe('Orhei');
    expect(document.activeElement).toBe(input);
  });

  it('clicking an option selects it and keeps focus in the input', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    input.focus();
    await type(fixture, input, 'ch');
    optionEls()[0].click();
    await fixture.whenStable();

    expect(host.value()).toBe('chisinau');
    expect(host.query()).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it('Escape and Tab close and clear the query without changing the value', async () => {
    const { fixture, host, input } = await renderSearch();

    host.value.set('balti');
    await fixture.whenStable();

    for (const name of ['Escape', 'Tab']) {
      await type(fixture, input, 'orh');
      expect(host.open()).toBe(true);

      await key(fixture, input, name);

      expect(host.open()).toBe(false);
      expect(host.query()).toBe('');
      expect(host.value()).toBe('balti');
      expect(input.value).toBe('Bălți');
    }
  });

  it('ArrowDown and ArrowUp open the panel and move the highlight', async () => {
    const { fixture, host, input } = await renderSearch();

    await key(fixture, input, 'ArrowDown');
    expect(host.open()).toBe(true);
    expect(activeLabel(input)).toBe('Chișinău');

    await key(fixture, input, 'ArrowDown');
    expect(activeLabel(input)).toBe('Bălți');

    await key(fixture, input, 'ArrowUp');
    expect(activeLabel(input)).toBe('Chișinău');
  });

  it('Home, End and Space are left to the text field', async () => {
    const { fixture, host, input } = await renderSearch();

    await type(fixture, input, 'o');
    const before = input.getAttribute('aria-activedescendant');

    for (const name of ['Home', 'End', ' ']) {
      const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });

      input.dispatchEvent(event);
      await fixture.whenStable();

      expect(event.defaultPrevented).toBe(false);
    }

    expect(host.open()).toBe(true);
    expect(input.getAttribute('aria-activedescendant')).toBe(before);
    expect(host.value()).toBeUndefined();
  });

  it('never runs type-to-jump: a letter does not jump the highlight to a matching option', async () => {
    const { fixture, input } = await renderSearch();

    await key(fixture, input, 'o');

    // Type-to-jump would land on Orhei; the field just opens with the first option primed.
    expect(activeLabel(input)).toBe('Chișinău');
  });

  it('when every visible option is disabled, Enter does nothing and there is no active descendant', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    await type(fixture, input, 'cahul');

    expect(optionEls()).toHaveLength(1);
    expect(input.getAttribute('aria-activedescendant')).toBeNull();

    await key(fixture, input, 'Enter');
    await key(fixture, input, 'ArrowDown');
    await key(fixture, input, 'Enter');

    expect(host.value()).toBeUndefined();
    expect(host.open()).toBe(true);
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
  });

  it('query set from outside re-filters while open and does not open a closed select', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    host.query.set('or');
    await fixture.whenStable();
    expect(host.open()).toBe(false);

    host.query.set('');
    input.click();
    await fixture.whenStable();
    expect(optionEls()).toHaveLength(4);

    host.query.set('or');
    await fixture.whenStable();
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(['Orhei']);
    expect(input.value).toBe('or');
    // The highlight follows the new view, never a stale index.
    expect(activeLabel(input)).toBe('Orhei');
  });

  it('filterWith null shows the options unfiltered while query still updates', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    host.filterWith.set(null);
    await fixture.whenStable();
    await type(fixture, input, 'zzz');

    expect(host.query()).toBe('zzz');
    expect(optionEls()).toHaveLength(4);
  });

  it('readonly and disabled searchable fields do not open on typing', async () => {
    const { fixture, host, input } = await renderSearch();

    host.readonly.set(true);
    await fixture.whenStable();
    expect(input.readOnly).toBe(true);
    await type(fixture, input, 'b');
    input.click();
    await key(fixture, input, 'ArrowDown');
    expect(host.open()).toBe(false);
    expect(host.query()).toBe('');

    host.readonly.set(false);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    await type(fixture, input, 'b');
    expect(host.open()).toBe(false);
    expect(host.query()).toBe('');
  });

  it('a custom filterWith replaces the default', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    host.filterWith.set((option, query) => option.label.startsWith(query));
    await fixture.whenStable();
    await type(fixture, input, 'h');
    expect(optionEls()).toHaveLength(0);

    await type(fixture, input, 'Or');
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(['Orhei']);
  });

  it('clicking an open field keeps it open; the chevron toggles it', async () => {
    const { fixture, host, el, input } = await renderSearch();
    const chevron = el.querySelector('.select-field__chevron') as HTMLElement;

    input.click();
    await fixture.whenStable();
    input.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);

    chevron.click();
    await fixture.whenStable();
    expect(host.open()).toBe(false);

    chevron.click();
    await fixture.whenStable();
    expect(host.open()).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it('emits touch on blur and focus() targets the input', async () => {
    const { fixture, input } = await renderSearch();
    const select = fixture.debugElement.children[0].componentInstance as MudSelectInput;
    const touched = vi.fn();

    select.touch.subscribe(touched);
    select.focus();
    await fixture.whenStable();
    expect(document.activeElement).toBe(input);
    expect(input.closest('mud-select-input')!.classList.contains('is-focused')).toBe(true);

    input.blur();
    await fixture.whenStable();
    expect(touched).toHaveBeenCalledTimes(1);
    expect(input.closest('mud-select-input')!.classList.contains('is-focused')).toBe(false);
  });

  // Virtual keyboards (Gboard: key "Unidentified") and IMEs ("Process") give no usable keydown,
  // so the label must already be selected: any insertion then replaces it natively.
  it('focusing a closed field that shows a label selects all of its text', async () => {
    const { fixture, host, input } = await renderSearch();

    host.value.set('chisinau');
    await fixture.whenStable();

    input.focus();
    await fixture.whenStable();

    expect(input.value).toBe('Chișinău');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Chișinău'.length);
  });

  it('re-selects the label when the list closes with focus still in the field', async () => {
    const { fixture, host, input } = await renderSearch();

    host.value.set('chisinau');
    await fixture.whenStable();
    input.focus();
    await type(fixture, input, 'orh');
    await key(fixture, input, 'Enter');

    expect(input.value).toBe('Orhei');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Orhei'.length);

    await type(fixture, input, 'b');
    await key(fixture, input, 'Escape');
    expect(input.value).toBe('Orhei');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Orhei'.length);
  });

  it('an input event whose text replaced the selected label opens with just that text', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    host.value.set('chisinau');
    await fixture.whenStable();
    input.focus();
    await fixture.whenStable();

    // No keydown: what a virtual keyboard does once the selection is replaced.
    await type(fixture, input, 'c');

    expect(host.open()).toBe(true);
    expect(host.query()).toBe('c');
    expect(optionEls().map((o) => o.textContent?.trim())).toEqual(['Chișinău', 'Cahul']);
  });

  it('scrolls the first match into view when a query moves the highlight', async () => {
    const { fixture, host, input } = await renderSearch();
    const long = Array.from({ length: 40 }, (_, i) => ({
      value: `v${i}`,
      label: i === 0 ? 'Anenii Noi' : `Raion ${i}`,
    }));
    const scrolled: Element[] = [];

    (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = function (
      this: Element,
    ) {
      scrolled.push(this);
    };

    try {
      host.options.set(long);
      host.value.set('v39');
      await fixture.whenStable();
      input.focus();
      await key(fixture, input, 'ArrowDown');
      expect(activeLabel(input)).toBe('Raion 39');

      scrolled.length = 0;
      await type(fixture, input, 'a');

      expect(activeLabel(input)).toBe('Anenii Noi');
      expect(scrolled.map((el) => el.textContent?.trim())).toContain('Anenii Noi');
    } finally {
      delete (Element.prototype as unknown as { scrollIntoView?: () => void }).scrollIntoView;
    }
  });

  it('a list closed from outside reopens with an empty query', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    input.focus();
    await type(fixture, input, 'orh');
    expect(optionEls()).toHaveLength(1);

    // [(open)]="false" from the host skips the component's own close path.
    host.open.set(false);
    await fixture.whenStable();

    input.click();
    await fixture.whenStable();

    expect(host.open()).toBe(true);
    expect(host.query()).toBe('');
    expect(input.value).toBe('');
    expect(optionEls()).toHaveLength(4);
  });

  it('a list closed and reopened from outside starts from an empty query with a highlight', async () => {
    const { fixture, host, input, optionEls } = await renderSearch();

    input.focus();
    await type(fixture, input, 'orh');

    // Both directions through [(open)] skip the component's own open/close paths.
    host.open.set(false);
    await fixture.whenStable();
    expect(host.query()).toBe('');

    host.open.set(true);
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(optionEls()).toHaveLength(4);
    expect(activeLabel(input)).not.toBeNull();
  });

  it('a pointer resting over the list does not take the highlight when filtering moves rows under it', async () => {
    const { fixture, input, optionEls } = await renderSearch();
    const move = (el: HTMLElement, x: number, y: number) =>
      el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, screenX: x, screenY: y }));

    input.focus();
    await type(fixture, input, 'a');
    move(optionEls()[1], 10, 40);
    await fixture.whenStable();
    expect(activeLabel(input)).toBe('Bălți');

    // 'i' keeps Chișinău, Bălți, Orhei; the highlight resets to the first.
    await type(fixture, input, 'i');
    expect(activeLabel(input)).toBe('Chișinău');

    // The same screen point now over Orhei: a layout shift, not a move.
    move(optionEls()[2], 10, 40);
    await fixture.whenStable();
    expect(activeLabel(input)).toBe('Chișinău');

    move(optionEls()[2], 10, 44);
    await fixture.whenStable();
    expect(activeLabel(input)).toBe('Orhei');
  });

  it('hovering a row does not scroll the list; a new query does', async () => {
    const scrolled: Element[] = [];

    (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = function (
      this: Element,
    ) {
      scrolled.push(this);
    };

    try {
      const { fixture, input, optionEls } = await renderSearch();

      input.focus();
      await type(fixture, input, 'a');
      scrolled.length = 0;

      optionEls()[1].dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, screenX: 1, screenY: 1 }),
      );
      await fixture.whenStable();
      expect(scrolled).toEqual([]);

      await type(fixture, input, 'b');
      expect(scrolled.length).toBeGreaterThan(0);
    } finally {
      delete (Element.prototype as unknown as { scrollIntoView?: () => void }).scrollIntoView;
    }
  });
});

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input searchable aria-label="Raion" [options]="options" [(open)]="open">
      <svg icon-start class="probe" viewBox="0 0 20 20"></svg>
    </mud-select-input>
  `,
})
class SearchIconHost {
  readonly options = OPTIONS;
  readonly open = signal(false);
}

describe('MudSelectInput searchable start icon', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('focuses the input and opens, and does not close an open field', async () => {
    const fixture = TestBed.createComponent(SearchIconHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;
    const icon = el.querySelector('svg.probe') as SVGElement;

    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(document.activeElement).toBe(el.querySelector('input'));

    // mousedown is cancelled so the input keeps focus (no blur-close, then reopen).
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });

    icon.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);

    icon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(document.activeElement).toBe(el.querySelector('input'));
  });
});

interface City {
  id: number;
  name: string;
}

const city = (id: number, name: string): MudSelectOption<City> => ({
  value: { id, name },
  label: name,
});

@Component({
  imports: [MudSelectInput, ReactiveFormsModule],
  template: `
    <mud-select-input
      searchable
      aria-label="City"
      placeholder="Alegeți orașul"
      [options]="options()"
      [filterWith]="null"
      [compareWith]="byId"
      [loading]="loading()"
      [formControl]="control"
      [(open)]="open"
    />
  `,
})
class ServerHost {
  readonly options = signal<readonly MudSelectItem<City>[]>([
    city(1, 'Chișinău'),
    city(2, 'Bălți'),
    city(3, 'Cahul'),
    city(4, 'Orhei'),
  ]);
  readonly loading = signal(false);
  readonly open = signal(false);
  readonly control = new FormControl<City | null>(null);
  readonly byId = (a: City | undefined, b: City | undefined) => a?.id === b?.id;
}

describe('MudSelectInput server search', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  async function renderServer() {
    const fixture = TestBed.createComponent(ServerHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-select-input') as HTMLElement;
    const input = el.querySelector('input.select-field__trigger') as HTMLInputElement;

    return {
      fixture,
      host: fixture.componentInstance,
      el,
      input,
      live: () => el.querySelector<HTMLElement>('[aria-live="polite"]'),
      optionEls: () => Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')),
    };
  }

  async function type(
    fixture: { whenStable(): Promise<unknown> },
    input: HTMLInputElement,
    text: string,
  ) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  it('loading replaces the options with one loading row and announces loadingText', async () => {
    const { fixture, host, input, live, optionEls } = await renderServer();

    // The live region exists before anything is announced, so screen readers pick up the change.
    expect(live()?.classList.contains('input-field__sr-only')).toBe(true);
    expect(live()?.textContent?.trim()).toBe('');

    input.click();
    host.loading.set(true);
    await fixture.whenStable();

    const row = document.querySelector<HTMLElement>('.menu-panel__loading');

    expect(optionEls()).toHaveLength(0);
    expect(row?.textContent?.trim()).toBe('Loading…');
    expect(row?.getAttribute('role')).toBe('option');
    expect(row?.getAttribute('aria-disabled')).toBe('true');
    expect(row?.querySelector('.menu-panel__spinner')?.getAttribute('aria-hidden')).toBe('true');
    expect(live()?.textContent?.trim()).toBe('Loading…');
    // The hidden options cannot be the active descendant, nor picked with Enter.
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    await key(fixture, input, 'Enter');
    expect(host.control.value).toBeNull();

    host.loading.set(false);
    await fixture.whenStable();
    expect(optionEls()).toHaveLength(4);
    expect(live()?.textContent?.trim()).toBe('');
  });

  it('keeps showing the picked label after server results no longer contain it', async () => {
    const { fixture, host, input, optionEls } = await renderServer();

    input.click();
    await fixture.whenStable();
    optionEls()[1].click();
    await fixture.whenStable();
    expect(host.control.value).toEqual({ id: 2, name: 'Bălți' });

    host.options.set([city(7, 'Soroca')]);
    await fixture.whenStable();

    expect(input.value).toBe('Bălți');
    input.click();
    await fixture.whenStable();
    expect(input.placeholder).toBe('Bălți');
    // The remembered label only fills the field; it is not a fake option in the list.
    expect(optionEls().map((o) => o.getAttribute('aria-selected'))).toEqual(['false']);
    expect(warn).not.toHaveBeenCalled();
  });

  it('remembers a label seen in an earlier options list, not only one picked', async () => {
    const { fixture, host, input } = await renderServer();

    host.control.setValue({ id: 3, name: 'Cahul' });
    await fixture.whenStable();
    expect(input.value).toBe('Cahul');

    host.options.set([city(7, 'Soroca')]);
    await fixture.whenStable();

    expect(input.value).toBe('Cahul');
    expect(warn).not.toHaveBeenCalled();
  });

  it('still warns for a value that no options list ever contained', async () => {
    const { fixture, host, input } = await renderServer();

    host.control.setValue({ id: 99, name: 'Nowhere' });
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(warn).toHaveBeenCalled();
  });

  it('clearing the value from a form shows the placeholder, not the remembered label', async () => {
    const { fixture, host, input, optionEls } = await renderServer();

    input.click();
    await fixture.whenStable();
    optionEls()[1].click();
    await fixture.whenStable();
    host.options.set([city(7, 'Soroca')]);
    await fixture.whenStable();
    expect(input.value).toBe('Bălți');

    host.control.reset();
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Alegeți orașul');

    // Setting the same value again must not resurrect a stale label either.
    host.control.setValue({ id: 2, name: 'Bălți' });
    await fixture.whenStable();
    expect(input.value).toBe('Bălți');
  });

  it('new results while open move the highlight to their first enabled option', async () => {
    const { fixture, host, input } = await renderServer();

    input.focus();
    await type(fixture, input, 'o');
    for (let i = 0; i < 3; i++) await key(fixture, input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-3$/);

    host.options.set([{ ...city(5, 'Ocnița'), disabled: true }, city(6, 'Otaci')]);
    await fixture.whenStable();

    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);

    host.options.set([city(8, 'Ungheni'), city(9, 'Edineț')]);
    await fixture.whenStable();

    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);
    expect(document.querySelector('.menu-panel__option.is-highlighted')?.textContent?.trim()).toBe(
      'Ungheni',
    );
  });

  it('results that arrive after a loading row highlight their first enabled option', async () => {
    const { fixture, host, input } = await renderServer();

    input.focus();
    await type(fixture, input, 'so');
    host.loading.set(true);
    await fixture.whenStable();
    expect(input.getAttribute('aria-activedescendant')).toBeNull();

    host.options.set([city(7, 'Soroca')]);
    host.loading.set(false);
    await fixture.whenStable();

    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/);
  });

  it('arrow keys leave the highlight alone while loading hides the options', async () => {
    const { fixture, host, input } = await renderServer();

    input.focus();
    await type(fixture, input, 'c');
    const before = input.getAttribute('aria-activedescendant');

    host.loading.set(true);
    await fixture.whenStable();
    await key(fixture, input, 'ArrowDown');
    await key(fixture, input, 'ArrowDown');
    host.loading.set(false);
    await fixture.whenStable();

    expect(before).toMatch(/-opt-0$/);
    expect(input.getAttribute('aria-activedescendant')).toBe(before);
  });

  it('announces noResultsText when the query finds nothing', async () => {
    const { fixture, host, input, live } = await renderServer();

    input.focus();
    await type(fixture, input, 'zzz');
    host.options.set([]);
    await fixture.whenStable();

    expect(live()?.textContent?.trim()).toBe('No results');

    await key(fixture, input, 'Escape');
    expect(live()?.textContent?.trim()).toBe('');
  });
});

describe('MudSelectInput non-searchable unmatched value', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('a non-searchable select still shows the placeholder and warns for an unmatched value', async () => {
    const { fixture, host, trigger, optionEls } = await render();

    trigger.click();
    await fixture.whenStable();
    optionEls()[1].click();
    await fixture.whenStable();
    expect(trigger.textContent).toContain('Bălți');
    expect(warn).not.toHaveBeenCalled();

    host.options.set([{ value: 'soroca', label: 'Soroca' }]);
    await fixture.whenStable();

    expect(trigger.textContent).toContain('Alegeți raionul');
    expect(warn).toHaveBeenCalled();
  });
});
