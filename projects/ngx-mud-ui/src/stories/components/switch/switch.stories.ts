import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudSwitch } from 'ngx-mud-ui/switch';

const COL = 'display:flex;flex-direction:column;gap:20px;max-width:420px;padding:24px';

const meta: Meta<MudSwitch> = {
  title: 'Components/Switch',
  component: MudSwitch,
  decorators: [moduleMetadata({ imports: [MudSwitch] })],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
    label: 'Notificări prin e-mail',
  },
};

export default meta;

type Story = StoryObj<MudSwitch>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-switch [checked]="checked" [disabled]="disabled" [required]="required" [label]="label" />
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-switch label="Oprit" />
        <mud-switch label="Pornit" [checked]="true" />
        <mud-switch label="Dezactivat oprit" disabled />
        <mud-switch label="Dezactivat pornit" [checked]="true" disabled />
        <mud-switch aria-label="Fără etichetă vizibilă" />
      </div>
    `,
  }),
};

/** The switch applies instantly — typical settings-panel usage with reactive forms. */
@Component({
  selector: 'mud-switch-settings-demo',
  imports: [MudSwitch, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-switch label="Notificări prin e-mail" [formControl]="email" />
      <mud-switch label="Notificări SMS" [formControl]="sms" />
      <code>email: {{ email.value }} | sms: {{ sms.value }}</code>
    </div>
  `,
})
class SwitchSettingsDemo {
  readonly email = new FormControl(true, { nonNullable: true });
  readonly sms = new FormControl(false, { nonNullable: true });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const SETTINGS_PANEL_SOURCE = `
@Component({
  imports: [MudSwitch, ReactiveFormsModule],
  template: \`
    <mud-switch label="Notificări prin e-mail" [formControl]="email" />
    <mud-switch label="Notificări SMS" [formControl]="sms" />
  \`,
})
export class NotificationSettings {
  // A switch applies immediately — if the change only lands on Save, use a checkbox.
  readonly email = new FormControl(true, { nonNullable: true });
  readonly sms = new FormControl(false, { nonNullable: true });
}
`;

export const SettingsPanel: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SETTINGS_PANEL_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SwitchSettingsDemo] })],
  render: () => ({ template: `<mud-switch-settings-demo />` }),
};
