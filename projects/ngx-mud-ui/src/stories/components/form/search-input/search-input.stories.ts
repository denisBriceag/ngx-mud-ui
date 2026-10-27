  import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { MudSearchInput } from 'ngx-mud-ui/search-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

const meta: Meta<MudSearchInput> = {
  title: 'Components/Form/Search input',
  component: MudSearchInput,
  decorators: [moduleMetadata({ imports: [MudSearchInput, MudLabel, MudInlineMessage] })],
  argTypes: {
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    clearable: { control: 'boolean' },
    withButton: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    shape: 'rectangular',
    variant: 'default',
    size: 'medium',
    clearable: true,
    withButton: false,
    loading: false,
    disabled: false,
    invalid: false,
    placeholder: 'Caută servicii...',
  },
};

export default meta;

type Story = StoryObj<MudSearchInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${COL}">
        <mud-search-input
          [shape]="shape"
          [variant]="variant"
          [size]="size"
          [clearable]="clearable"
          [withButton]="withButton"
          [loading]="loading"
          [disabled]="disabled"
          [invalid]="invalid"
          [placeholder]="placeholder"
        >
          <mud-label>Căutare</mud-label>
        </mud-search-input>
      </div>
    `,
  }),
};

/** One component, both official silhouettes. */
export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-search-input placeholder="Caută..." value="pașaport">
          <mud-label>Rectangular</mud-label>
        </mud-search-input>
        <mud-search-input shape="circular" placeholder="Caută..." value="pașaport">
          <mud-label>Circular (pill)</mud-label>
        </mud-search-input>
        <mud-search-input shape="circular" withButton placeholder="Caută...">
          <mud-label>Circular cu buton</mud-label>
        </mud-search-input>
        <mud-search-input size="large" withButton placeholder="Caută...">
          <mud-label>Rectangular cu buton, large</mud-label>
        </mud-search-input>
      </div>
    `,
  }),
};

/** Loading suppresses interaction; destructive is the only status variant. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-search-input loading value="acte de stare civilă">
          <mud-label>Se caută</mud-label>
        </mud-search-input>
        <mud-search-input invalid value="ab">
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Introduceți minim 3 caractere.</mud-inline-message>
        </mud-search-input>
        <mud-search-input disabled placeholder="Indisponibil">
          <mud-label>Dezactivat</mud-label>
        </mud-search-input>
      </div>
    `,
  }),
};

/** Live demo: Enter or the submit button fires (search); clearing fires (cleared). */
@Component({
  selector: 'mud-search-demo',
  imports: [MudSearchInput, MudLabel],
  template: `
    <div style="${COL}">
      <mud-search-input
        shape="circular"
        withButton
        placeholder="De ex. buletin de identitate"
        (searched)="last.set($event)"
        (cleared)="last.set('(golit)')"
      >
        <mud-label>Căutare servicii</mud-label>
      </mud-search-input>
      <code>ultima acțiune: {{ last() || '—' }}</code>
    </div>
  `,
})
class SearchDemo {
  readonly last = signal('');
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const INTERACTIVE_SOURCE = `
@Component({
  imports: [MudSearchInput, MudLabel],
  template: \`
    <mud-search-input
      shape="circular"
      withButton
      placeholder="De ex. buletin de identitate"
      (searched)="run($event)"
      (cleared)="reset()"
    >
      <mud-label>Căutare servicii</mud-label>
    </mud-search-input>
  \`,
})
export class ServiceSearch {
  // \`searched\` fires on Enter and on the submit button — the "user asked for
  // results" moment. Bind \`valueChange\` only if you need every keystroke.
  run(query: string): void {
    // fetch results for \`query\`
  }

  reset(): void {
    // clear results
  }
}
`;

export const Interactive: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: INTERACTIVE_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SearchDemo] })],
  render: () => ({ template: `<mud-search-demo />` }),
};
