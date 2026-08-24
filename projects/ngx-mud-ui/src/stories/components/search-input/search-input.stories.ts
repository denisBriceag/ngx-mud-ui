  import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:420px;padding:24px';

const meta: Meta<MudSearchInput> = {
  title: 'Components/Search input',
  component: MudSearchInput,
  decorators: [moduleMetadata({ imports: [MudSearchInput] })],
  argTypes: {
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    clearable: { control: 'boolean' },
    withButton: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
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
    label: 'Căutare',
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
          [label]="label"
          [placeholder]="placeholder"
        />
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
        <mud-search-input label="Rectangular" placeholder="Caută..." value="pașaport" />
        <mud-search-input label="Circular (pill)" shape="circular" placeholder="Caută..." value="pașaport" />
        <mud-search-input label="Circular cu buton" shape="circular" withButton placeholder="Caută..." />
        <mud-search-input label="Rectangular cu buton, large" size="large" withButton placeholder="Caută..." />
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
        <mud-search-input label="Se caută" loading value="acte de stare civilă" />
        <mud-search-input label="Eroare" invalid errorText="Introduceți minim 3 caractere." value="ab" />
        <mud-search-input label="Dezactivat" disabled placeholder="Indisponibil" />
      </div>
    `,
  }),
};

/** Live demo: Enter or the submit button fires (search); clearing fires (cleared). */
@Component({
  selector: 'mud-search-demo',
  imports: [MudSearchInput],
  template: `
    <div style="${COL}">
      <mud-search-input
        label="Căutare servicii"
        shape="circular"
        withButton
        placeholder="De ex. buletin de identitate"
        (searched)="last.set($event)"
        (cleared)="last.set('(golit)')"
      />
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
  imports: [MudSearchInput],
  template: \`
    <mud-search-input
      label="Căutare servicii"
      shape="circular"
      withButton
      placeholder="De ex. buletin de identitate"
      (searched)="run($event)"
      (cleared)="reset()"
    />
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
