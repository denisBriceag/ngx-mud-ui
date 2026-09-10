import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from 'ngx-mud-ui/text-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:20px;max-width:420px;padding:24px';

const meta: Meta<MudCheckbox> = {
  title: 'Components/Checkbox',
  component: MudCheckbox,
  decorators: [moduleMetadata({ imports: [MudCheckbox] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
    supportingText: { control: 'text' },
    errorText: { control: 'text' },
  },
  args: {
    size: 'medium',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    label: 'Accept termenii și condițiile',
    supportingText: 'Se aplică termenii serviciului MPay.',
  },
};

export default meta;

type Story = StoryObj<MudCheckbox>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-checkbox
          [size]="size"
          [checked]="checked"
          [indeterminate]="indeterminate"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [label]="label"
          [supportingText]="supportingText"
          [errorText]="errorText"
        />
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-checkbox label="Nebifat" supportingText="Text de suport." />
        <mud-checkbox label="Bifat" checked />
        <mud-checkbox label="Mixt (indeterminate)" indeterminate />
        <mud-checkbox label="Eroare" invalid errorText="Trebuie să acceptați termenii." required />
        <mud-checkbox label="Doar citire" checked readonly supportingText="Focusabil, dar nu se poate schimba." />
        <mud-checkbox label="Dezactivat" disabled supportingText="Nu este disponibil." />
        <mud-checkbox label="Dezactivat bifat" checked disabled />
        <mud-checkbox label="Mic (small)" size="small" supportingText="20px, text 14/20." checked />
      </div>
    `,
  }),
};

/**
 * indeterminate is consumer-owned: the select-all manager below recomputes it
 * from its children on every change.
 */
@Component({
  selector: 'mud-checkbox-select-all-demo',
  imports: [MudCheckbox],
  template: `
    <div style="${COL}">
      <mud-checkbox
        label="Selectează toate serviciile"
        [checked]="allChecked()"
        [indeterminate]="someChecked()"
        (checkedChange)="setAll($event)"
      />
      <div style="display:flex;flex-direction:column;gap:12px;padding-left:36px">
        @for (service of services(); track service.name; let i = $index) {
          <mud-checkbox size="small" [label]="service.name" [checked]="service.on" (checkedChange)="toggle(i, $event)" />
        }
      </div>
    </div>
  `,
})
class CheckboxSelectAllDemo {
  readonly services = signal([
    { name: 'MPay', on: true },
    { name: 'MSign', on: false },
    { name: 'MNotify', on: false },
  ]);

  readonly allChecked = computed(() => this.services().every((s) => s.on));
  readonly someChecked = computed(() => !this.allChecked() && this.services().some((s) => s.on));

  toggle(index: number, on: boolean): void {
    this.services.update((list) => list.map((s, i) => (i === index ? { ...s, on } : s)));
  }

  setAll(on: boolean): void {
    this.services.update((list) => list.map((s) => ({ ...s, on })));
  }
}

/**
 * Rich content via the shared slots: [mudLabel] for the label, [mudHelper]
 * for the supporting line, [mudError] for the error — import the marker
 * directives from ngx-mud-ui/text-input). The wiring (label
 * association, aria-describedby, role=alert) is kept by the component.
 */
export const ComposedContent: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [MudCheckbox, MudFieldLabel, MudFieldHelper, MudFieldError, MudInlineMessage] })],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-checkbox checked>
          <span mudLabel>Accept <a href="#" (click)="$event.preventDefault()">termenii serviciului</a></span>
          <span mudHelper>Versiunea din <strong>21 august 2026</strong>; se aplică tuturor plăților MPay.</span>
        </mud-checkbox>
        <mud-checkbox invalid required>
          <span mudLabel>Consimțământ prelucrare date</span>
          <mud-inline-message mudError variant="error" size="small" hideIcon>
            Bifați consimțământul pentru a continua.
          </mud-inline-message>
        </mud-checkbox>
      </div>
    `,
  }),
};

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const SELECT_ALL_SOURCE = `
@Component({
  imports: [MudCheckbox],
  template: \`
    <mud-checkbox
      label="Selectează toate serviciile"
      [checked]="allChecked()"
      [indeterminate]="someChecked()"
      (checkedChange)="setAll($event)"
    />
    @for (service of services(); track service.name; let i = $index) {
      <mud-checkbox size="small" [label]="service.name" [checked]="service.on" (checkedChange)="toggle(i, $event)" />
    }
  \`,
})
export class ServiceSelection {
  readonly services = signal([
    { name: 'MPay', on: true },
    { name: 'MSign', on: false },
    { name: 'MNotify', on: false },
  ]);

  // \`indeterminate\` is consumer-owned: a user toggle never clears it, so derive
  // it here and keep it in sync yourself.
  readonly allChecked = computed(() => this.services().every((s) => s.on));
  readonly someChecked = computed(() => !this.allChecked() && this.services().some((s) => s.on));

  toggle(index: number, on: boolean): void {
    this.services.update((list) => list.map((s, i) => (i === index ? { ...s, on } : s)));
  }

  setAll(on: boolean): void {
    this.services.update((list) => list.map((s) => ({ ...s, on })));
  }
}
`;

export const SelectAll: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SELECT_ALL_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [CheckboxSelectAllDemo] })],
  render: () => ({ template: `<mud-checkbox-select-all-demo />` }),
};
