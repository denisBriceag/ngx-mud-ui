import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudSwitch } from 'ngx-mud-ui/switch';
import { MudLabel } from 'ngx-mud-ui/label';

const COL = 'display:flex;flex-direction:column;gap:20px;max-width:420px;padding:24px';

const meta: Meta<MudSwitch> = {
  title: 'Components/Form/Switch',
  component: MudSwitch,
  decorators: [moduleMetadata({ imports: [MudSwitch, MudLabel] })],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
  },
};

export default meta;

type Story = StoryObj<MudSwitch>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-switch [checked]="checked" [disabled]="disabled" [required]="required">
          <mud-label>Notificări prin e-mail</mud-label>
        </mud-switch>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-switch><mud-label>Oprit</mud-label></mud-switch>
        <mud-switch [checked]="true"><mud-label>Pornit</mud-label></mud-switch>
        <mud-switch disabled><mud-label>Dezactivat oprit</mud-label></mud-switch>
        <mud-switch [checked]="true" disabled><mud-label>Dezactivat pornit</mud-label></mud-switch>
        <mud-switch aria-label="Fără etichetă vizibilă" />
      </div>
    `,
  }),
};

/** The switch applies instantly — typical settings-panel usage with reactive forms. */
@Component({
  selector: 'mud-switch-settings-demo',
  imports: [MudSwitch, MudLabel, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-switch [formControl]="email"><mud-label>Notificări prin e-mail</mud-label></mud-switch>
      <mud-switch [formControl]="sms"><mud-label>Notificări SMS</mud-label></mud-switch>
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
  imports: [MudSwitch, MudLabel, ReactiveFormsModule],
  template: \`
    <mud-switch [formControl]="email"><mud-label>Notificări prin e-mail</mud-label></mud-switch>
    <mud-switch [formControl]="sms"><mud-label>Notificări SMS</mud-label></mud-switch>
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
