import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudChip } from '../mud-chip.component';
import type { MudChipSelectionMode, MudChipSize, MudChipType } from '../mud-chip.component';

@Component({
  imports: [MudChip],
  template: `
    <mud-chip
      [type]="type()"
      [size]="size()"
      [(selected)]="selected"
      [selectionMode]="selectionMode()"
      [count]="count()"
      [disabled]="disabled()"
      [removable]="removable()"
      [removeLabel]="removeLabel()"
      label="Acte"
      (removed)="removals = removals + 1"
    >
      Acte necesare
    </mud-chip>
  `,
})
class Host {
  readonly type = signal<MudChipType>('filter');
  readonly size = signal<MudChipSize>('md');
  readonly selected = signal(false);
  readonly selectionMode = signal<MudChipSelectionMode>('mono');
  readonly count = signal<number | undefined>(undefined);
  readonly disabled = signal(false);
  readonly removable = signal(false);
  readonly removeLabel = signal<((label: string) => string) | undefined>(undefined);
  removals = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-chip') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    control: () => el.querySelector('.chip__control') as HTMLElement,
    removeBtn: () => el.querySelector<HTMLButtonElement>('.chip__remove'),
  };
}

describe('MudChip', () => {
  it('remove label: default, pack, instance function', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, host, removeBtn } = await render();

    host.type.set('input');
    host.removable.set(true);
    await fixture.whenStable();
    expect(removeBtn()!.getAttribute('aria-label')).toBe('Elimină Acte');

    host.removeLabel.set((label) => `Drop ${label}`);
    await fixture.whenStable();
    expect(removeBtn()!.getAttribute('aria-label')).toBe('Drop Acte');
  });

  it('renders a filter chip as a toggle button with aria-pressed', async () => {
    const { fixture, host, el, control } = await render();

    expect(control().tagName).toBe('BUTTON');
    expect(control().getAttribute('aria-pressed')).toBe('false');
    expect(control().textContent).toContain('Acte necesare');

    control().click();
    await fixture.whenStable();

    expect(host.selected()).toBe(true);
    expect(control().getAttribute('aria-pressed')).toBe('true');
    expect(el.classList.contains('is-selected')).toBe(true);

    control().click();
    await fixture.whenStable();
    expect(host.selected()).toBe(false);
  });

  it('shows the automatic check only for selected multi-mode filter chips', async () => {
    const { fixture, host, el } = await render();

    host.selectionMode.set('multi');
    await fixture.whenStable();
    expect(el.querySelector('.chip__check')).toBeNull();

    host.selected.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.chip__check')).toBeTruthy();
    expect(el.classList.contains('shows-check')).toBe(true);

    // Mono mode never renders the check, selected or not.
    host.selectionMode.set('mono');
    await fixture.whenStable();
    expect(el.querySelector('.chip__check')).toBeNull();
  });

  it('renders the count badge only for finite numbers', async () => {
    const { fixture, host, el } = await render();

    expect(el.querySelector('.chip__count')).toBeNull();

    host.count.set(12);
    await fixture.whenStable();
    expect(el.querySelector('.chip__count')?.textContent?.trim()).toBe('12');

    host.count.set(undefined);
    await fixture.whenStable();
    expect(el.querySelector('.chip__count')).toBeNull();
  });

  it('renders input chips without a dead tab stop and removes via the trailing button', async () => {
    const { fixture, host, el, control, removeBtn } = await render();

    host.type.set('input');
    await fixture.whenStable();

    // The body is static — the only interactive element is the remove button.
    expect(control().tagName).toBe('SPAN');
    expect(control().getAttribute('aria-pressed')).toBeNull();
    expect(removeBtn()).toBeNull();

    host.removable.set(true);
    await fixture.whenStable();

    const remove = removeBtn()!;

    expect(el.classList.contains('is-removable')).toBe(true);
    expect(remove.getAttribute('aria-label')).toBe('Remove Acte');

    remove.click();
    await fixture.whenStable();
    expect(host.removals).toBe(1);
  });

  it('clicking a filter chip never emits removed, and selected is ignored for input chips', async () => {
    const { fixture, host, el, control } = await render();

    host.type.set('input');
    host.removable.set(true);
    host.selected.set(true);
    await fixture.whenStable();

    // Input chips never take the selected surface.
    expect(el.classList.contains('is-selected')).toBe(false);

    control().click();
    await fixture.whenStable();
    expect(host.removals).toBe(0);
    expect(host.selected()).toBe(true);
  });

  it('disables all interactivity when disabled', async () => {
    const { fixture, host, el, control, removeBtn } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    expect((control() as HTMLButtonElement).disabled).toBe(true);
    expect(el.classList.contains('is-disabled')).toBe(true);

    control().click();
    await fixture.whenStable();
    expect(host.selected()).toBe(false);

    host.type.set('input');
    host.removable.set(true);
    await fixture.whenStable();
    expect(removeBtn()!.disabled).toBe(true);
  });

  it('coerces a static selected attribute (model() has no booleanAttribute transform)', async () => {
    const fixture = TestBed.createComponent(StaticSelectedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-chip') as HTMLElement;
    const control = el.querySelector('.chip__control') as HTMLButtonElement;

    // A bare `selected` attribute delivers '' to the model — it must still
    // read as pressed with a VALID aria-pressed value (axe aria-valid-attr-value).
    expect(control.getAttribute('aria-pressed')).toBe('true');
    expect(el.classList.contains('is-selected')).toBe(true);
    expect(el.querySelector('.chip__check')).toBeTruthy();

    control.click();
    await fixture.whenStable();
    expect(control.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies the size class and projects leading visuals into their wrappers', async () => {
    const fixture = TestBed.createComponent(SlotsHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-chip') as HTMLElement;

    expect(el.classList.contains('chip--sm')).toBe(true);
    expect(el.querySelector('.chip__icon svg')).toBeTruthy();
    expect(el.querySelector('.chip__avatar img')).toBeTruthy();
  });
});

@Component({
  imports: [MudChip],
  // $any('') mimics a bare `selected` attribute: non-strict templates
  // (Storybook stories) deliver '' to the boolean model at runtime.
  template: `<mud-chip selectionMode="multi" [selected]="$any('')" [count]="7">În lucru</mud-chip>`,
})
class StaticSelectedHost {}

@Component({
  imports: [MudChip],
  template: `
    <mud-chip type="input" size="sm">
      <img avatar src="data:," alt="" />
      <svg icon-start viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /></svg>
      Ana Popescu
    </mud-chip>
  `,
})
class SlotsHost {}
