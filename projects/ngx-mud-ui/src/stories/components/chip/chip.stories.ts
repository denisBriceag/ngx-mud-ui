import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { MudChip } from 'ngx-mud-ui/chip';

const ROW = 'display:flex;flex-wrap:wrap;align-items:center;gap:12px;padding:24px';
const COL = 'display:flex;flex-direction:column;gap:24px;padding:24px';

const meta: Meta<MudChip> = {
  title: 'Components/Chip',
  component: MudChip,
  decorators: [moduleMetadata({ imports: [MudChip] })],
  argTypes: {
    type: { control: 'inline-radio', options: ['filter', 'input'] },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    selectionMode: { control: 'inline-radio', options: ['mono', 'multi'] },
    selected: { control: 'boolean' },
    count: { control: 'number' },
    disabled: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
  args: {
    type: 'filter',
    size: 'medium',
    selectionMode: 'mono',
    selected: false,
    disabled: false,
    removable: false,
  },
};

export default meta;

type Story = StoryObj<MudChip>;

export const Playground: Story = {
  args: {
    removable: true,
  },

  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <mud-chip
          [type]="type"
          [size]="size"
          [selectionMode]="selectionMode"
          [selected]="selected"
          [count]="count"
          [disabled]="disabled"
          [removable]="removable"
        >
          Acte necesare
        </mud-chip>
      </div>
    `,
  }),
};

/** Mono filtering (radio-like, exclusivity is consumer-owned) and multi filtering (auto ✓). */
@Component({
  selector: 'mud-chip-filter-demo',
  imports: [MudChip],
  template: `
    <div style="${COL}">
      <div style="${ROW};padding:0">
        @for (category of categories; track category) {
          <mud-chip
            [selected]="active() === category"
            (selectedChange)="active.set($event ? category : null)"
          >
            {{ category }}
          </mud-chip>
        }
      </div>
      <code>filtru activ: {{ active() ?? '—' }}</code>
      <div style="${ROW};padding:0">
        <mud-chip selectionMode="multi" [count]="24">Depuse</mud-chip>
        <mud-chip selectionMode="multi" selected [count]="7">În lucru</mud-chip>
        <mud-chip selectionMode="multi" selected>Respinse</mud-chip>
        <mud-chip selectionMode="multi" disabled [count]="0">Arhivate</mud-chip>
      </div>
    </div>
  `,
})
class ChipFilterDemo {
  readonly categories = ['Toate', 'Acte de stare civilă', 'Transport', 'Educație'];
  readonly active = signal<string | null>('Toate');
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const FILTER_MODES_SOURCE = `
@Component({
  imports: [MudChip],
  template: \`
    <!-- mono (default): the chip only toggles itself — keeping the group
         exclusive is the parent's job, via selectedChange. -->
    @for (category of categories; track category) {
      <mud-chip [selected]="active() === category" (selectedChange)="active.set($event ? category : null)">
        {{ category }}
      </mud-chip>
    }

    <!-- multi: a leading check renders automatically while selected -->
    <mud-chip selectionMode="multi" [count]="24">Depuse</mud-chip>
    <mud-chip selectionMode="multi" selected [count]="7">În lucru</mud-chip>
  \`,
})
export class ChipFilters {
  readonly categories = ['Toate', 'Acte de stare civilă', 'Transport', 'Educație'];
  readonly active = signal<string | null>('Toate');
}
`;

export const FilterModes: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: FILTER_MODES_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [ChipFilterDemo] })],
  render: () => ({ template: `<mud-chip-filter-demo />` }),
};

/** Input chips: static tokens with a remove button; the avatar hugs the leading edge. */
@Component({
  selector: 'mud-chip-input-demo',
  imports: [MudChip],
  template: `
    <div style="${COL}">
      <div style="${ROW};padding:0">
        @for (person of people(); track person.name) {
          <mud-chip
            type="input"
            removable
            [label]="person.name"
            (removed)="drop(person.name)"
          >
            <img avatar [src]="person.photo" alt="" />
            {{ person.name }}
          </mud-chip>
        }
      </div>
      @if (people().length === 0) {
        <code>toate persoanele au fost eliminate</code>
      }
    </div>
  `,
})
class ChipInputDemo {
  readonly people = signal([
    { name: 'Ana Popescu', photo: 'https://i.pravatar.cc/56?img=1' },
    { name: 'Ion Rusu', photo: 'https://i.pravatar.cc/56?img=12' },
    { name: 'Maria Cebotari', photo: 'https://i.pravatar.cc/56?img=5' },
  ]);

  drop(name: string): void {
    this.people.update((people) => people.filter((person) => person.name !== name));
  }
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const INPUT_TOKENS_SOURCE = `
@Component({
  imports: [MudChip],
  template: \`
    @for (person of people(); track person.name) {
      <mud-chip type="input" removable [label]="person.name" (removed)="drop(person.name)">
        <img avatar [src]="person.photo" alt="" />
        {{ person.name }}
      </mud-chip>
    }
  \`,
})
export class RecipientTokens {
  readonly people = signal([
    { name: 'Ana Popescu', photo: '/avatars/ana.jpg' },
    { name: 'Ion Rusu', photo: '/avatars/ion.jpg' },
  ]);

  drop(name: string): void {
    this.people.update((people) => people.filter((person) => person.name !== name));
  }
}
`;

export const InputTokens: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: INPUT_TOKENS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [ChipInputDemo] })],
  render: () => ({ template: `<mud-chip-input-demo />` }),
};

export const SizesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <mud-chip>Mediu</mud-chip>
        <mud-chip size="small">Mic</mud-chip>
        <mud-chip [selected]="true">Selectat</mud-chip>
        <mud-chip disabled>Dezactivat</mud-chip>
        <mud-chip type="input" removable label="Etichetă">Etichetă</mud-chip>
        <mud-chip type="input" size="small" removable label="Mic">Mic</mud-chip>
      </div>
    `,
  }),
};
