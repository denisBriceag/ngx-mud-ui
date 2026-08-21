import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudInput, MudInputError, MudInputHelper, MudInputLabel } from '../../../input/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import { MudIconComponent, provideMudIcons, search, envelope } from '../../../icons/src/public-api';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px';

const meta: Meta<MudInput> = {
  title: 'Components/Input',
  component: MudInput,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([search, envelope])] }),
    moduleMetadata({ imports: [MudInput, MudIconComponent] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'warning', 'destructive', 'success'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'url', 'search'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    errorText: { control: 'text' },
    placeholder: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    type: 'text',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    loading: false,
    clearable: false,
    label: 'IDNP',
    helperText: 'Numărul personal de identificare, 13 cifre.',
    placeholder: 'De ex. 2000000000000',
  },
};

export default meta;

type Story = StoryObj<MudInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-input
          [variant]="variant"
          [size]="size"
          [type]="type"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [loading]="loading"
          [clearable]="clearable"
          [label]="label"
          [helperText]="helperText"
          [errorText]="errorText"
          [placeholder]="placeholder"
        />
      </div>
    `,
  }),
};

/** `invalid` forces destructive visuals; warning/success color the border and helper icon. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-input label="Default" helperText="Helper text." placeholder="Text" />
        <mud-input label="Warning" variant="warning" helperText="Verificați valoarea." value="M-2024" />
        <mud-input label="Success" variant="success" helperText="Valoare confirmată." value="2000000000000" />
        <mud-input label="Error" invalid errorText="Introduceți un IDNP valid." value="12345" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-input label="Medium (40px)" placeholder="14/20 text" />
        <mud-input label="Large (48px)" size="large" placeholder="16/24 text" />
      </div>
    `,
  }),
};

/** Disabled, read-only, and loading (uninteractive with a trailing spinner). */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-input label="Disabled" disabled value="Nu poate fi editat" />
        <mud-input label="Read-only" readonly value="Doar citire, selectabil" />
        <mud-input label="Loading" loading value="Se verifică..." />
      </div>
    `,
  }),
};

/** Icons project via the icon-start / icon-end attributes; clear (×) shows while non-empty. */
export const IconsAndClear: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-input label="Căutare" type="search" clearable value="pașaport">
          <mud-icon icon-start name="search" [scale]="20" />
        </mud-input>
        <mud-input label="Email" type="email" placeholder="nume@exemplu.md">
          <mud-icon icon-end name="envelope" [scale]="20" />
        </mud-input>
      </div>
    `,
  }),
};

/** Classic reactive forms via ControlValueAccessor. */
@Component({
  selector: 'mud-input-reactive-demo',
  imports: [MudInput, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-input
        label="IDNP"
        required
        [formControl]="idnp"
        [invalid]="idnp.touched && idnp.invalid"
        errorText="IDNP-ul trebuie să conțină 13 cifre."
        helperText="13 cifre."
        [maxLength]="13"
      />
      <code>value: {{ idnp.value }} | touched: {{ idnp.touched }} | valid: {{ idnp.valid }}</code>
    </div>
  `,
})
class InputReactiveDemo {
  readonly idnp = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{13}$/)],
  });
}

export const ReactiveForms: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [InputReactiveDemo] })],
  render: () => ({ template: `<mud-input-reactive-demo />` }),
};

/**
 * Signal forms via the FormValueControl contract: [formField] binds value,
 * required, invalid, and validation errors automatically — the required
 * message below comes from the field's validator, not from an input.
 * Note: this reflects signal forms' RAW invalid state (errors show
 * immediately). For custom display timing, skip [formField] and bind
 * manually: [(value)] + [invalid]="form.x().invalid() && form.x().touched()".
 */
@Component({
  selector: 'mud-input-signal-demo',
  imports: [MudInput, FormField, JsonPipe],
  template: `
    <div style="${COL}">
      <mud-input label="Nume complet" [formField]="form.name" helperText="Prenume și nume." />
      <code>model: {{ model() | json }} | touched: {{ form.name().touched() }}</code>
    </div>
  `,
})
class InputSignalDemo {
  readonly model = signal({ name: '' });
  readonly form = form(this.model, (path) => {
    required(path.name, { message: 'Numele este obligatoriu.' });
  });
}

export const SignalForms: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [InputSignalDemo] })],
  render: () => ({ template: `<mud-input-signal-demo />` }),
};

export const Composable: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [MudInputLabel, MudInputHelper, MudInputError, MudInlineMessage] })],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-input invalid value="12345">
          <span mudLabel>IDNP <em>(actul de identitate)</em></span>
          <mud-inline-message mudHelper hideIcon size="small">Numărul de 13 cifre de pe verso.</mud-inline-message>
          <mud-inline-message mudError variant="error" size="small">
            IDNP invalid — verificați cele 13 cifre.
          </mud-inline-message>
        </mud-input>

        <mud-input value="2000000000000">
          <span mudLabel>Același câmp, valid</span>
          <mud-inline-message mudHelper hideIcon size="small">Helperul revine când nu mai există eroare.</mud-inline-message>
          <mud-inline-message mudError variant="error" size="small">Nu se afișează.</mud-inline-message>
        </mud-input>
      </div>
    `,
  }),
};
