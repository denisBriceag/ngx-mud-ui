import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:20px;max-width:420px;padding:24px';

const meta: Meta<MudCheckbox> = {
  title: 'Components/Checkbox',
  component: MudCheckbox,
  decorators: [moduleMetadata({ imports: [MudCheckbox, MudLabel, MudInlineMessage] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    size: 'medium',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
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
        >
          <mud-label>Accept termenii și condițiile</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Trebuie să acceptați termenii.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Se aplică termenii serviciului MPay.</mud-inline-message>
          }
        </mud-checkbox>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-checkbox>
          <mud-label>Nebifat</mud-label>
          <mud-inline-message hideIcon>Text de suport.</mud-inline-message>
        </mud-checkbox>
        <mud-checkbox checked>
          <mud-label>Bifat</mud-label>
        </mud-checkbox>
        <mud-checkbox indeterminate>
          <mud-label>Mixt (indeterminate)</mud-label>
        </mud-checkbox>
        <mud-checkbox invalid required>
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Trebuie să acceptați termenii.</mud-inline-message>
        </mud-checkbox>
        <mud-checkbox checked readonly>
          <mud-label>Doar citire</mud-label>
          <mud-inline-message hideIcon>Focusabil, dar nu se poate schimba.</mud-inline-message>
        </mud-checkbox>
        <mud-checkbox disabled>
          <mud-label>Dezactivat</mud-label>
          <mud-inline-message hideIcon>Nu este disponibil.</mud-inline-message>
        </mud-checkbox>
        <mud-checkbox checked disabled>
          <mud-label>Dezactivat bifat</mud-label>
        </mud-checkbox>
        <mud-checkbox size="small" checked>
          <mud-label>Mic (small)</mud-label>
          <mud-inline-message hideIcon>20px, text 14/20.</mud-inline-message>
        </mud-checkbox>
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
  imports: [MudCheckbox, MudLabel],
  template: `
    <div style="${COL}">
      <mud-checkbox [checked]="allChecked()" [indeterminate]="someChecked()" (checkedChange)="setAll($event)">
        <mud-label>Selectează toate serviciile</mud-label>
      </mud-checkbox>
      <div style="display:flex;flex-direction:column;gap:12px;padding-left:36px">
        @for (service of services(); track service.name; let i = $index) {
          <mud-checkbox size="small" [checked]="service.on" (checkedChange)="toggle(i, $event)">
            <mud-label>{{ service.name }}</mud-label>
          </mud-checkbox>
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
 * Rich content projects directly: `<mud-label>` for the label, any number of
 * `<mud-inline-message>` elements for assistive text. The wiring (label
 * association, aria-describedby, role=alert) is kept by the component.
 */
export const ComposedContent: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-checkbox checked>
          <mud-label>Accept <a href="#" (click)="$event.preventDefault()">termenii serviciului</a></mud-label>
          <mud-inline-message hideIcon>Versiunea din <strong>21 august 2026</strong>; se aplică tuturor plăților MPay.</mud-inline-message>
        </mud-checkbox>
        <mud-checkbox invalid required>
          <mud-label>Consimțământ prelucrare date</mud-label>
          <mud-inline-message variant="error">Bifați consimțământul pentru a continua.</mud-inline-message>
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
  imports: [MudCheckbox, MudLabel],
  template: \`
    <mud-checkbox
      [checked]="allChecked()"
      [indeterminate]="someChecked()"
      (checkedChange)="setAll($event)"
    >
      <mud-label>Selectează toate serviciile</mud-label>
    </mud-checkbox>
    @for (service of services(); track service.name; let i = $index) {
      <mud-checkbox size="small" [checked]="service.on" (checkedChange)="toggle(i, $event)">
        <mud-label>{{ service.name }}</mud-label>
      </mud-checkbox>
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
