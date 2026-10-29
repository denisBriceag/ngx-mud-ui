import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudButton } from 'ngx-mud-ui/button';
import { download, eyeOpen, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

import { example } from '../../example';
import { MenuBasicExample } from './examples/menu-basic.example';
import basicSource from './examples/menu-basic.example.ts?raw';
import { MenuLeadingExample } from './examples/menu-leading.example';
import leadingSource from './examples/menu-leading.example.ts?raw';
import { MenuMegaExample } from './examples/menu-mega.example';
import megaSource from './examples/menu-mega.example.ts?raw';
import { MenuNestedExample } from './examples/menu-nested.example';
import nestedSource from './examples/menu-nested.example.ts?raw';
import { MenuPositionExample } from './examples/menu-position.example';
import positionSource from './examples/menu-position.example.ts?raw';
import { MenuSectionsExample } from './examples/menu-sections.example';
import sectionsSource from './examples/menu-sections.example.ts?raw';
import { MenuSelectionExample } from './examples/menu-selection.example';
import selectionSource from './examples/menu-selection.example.ts?raw';

const meta: Meta<MudMenu> = {
  title: 'Components/Menu',
  component: MudMenu,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([eyeOpen, download])] }),
    moduleMetadata({ imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger] }),
  ],
  argTypes: {
    type: { control: 'inline-radio', options: ['contextual', 'selection'] },
    xPosition: { control: 'inline-radio', options: ['after', 'before'] },
    yPosition: { control: 'inline-radio', options: ['below', 'above'] },
  },
  args: { type: 'contextual', xPosition: 'after', yPosition: 'below', closeOnSelect: true },
};

export default meta;

type Story = StoryObj<MudMenu>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <button type="button" mudButton="outlined" [mudMenuTriggerFor]="menu">Open menu</button>
      <mud-menu #menu aria-label="Playground" [type]="type" [xPosition]="xPosition" [yPosition]="yPosition" [closeOnSelect]="closeOnSelect">
        <mud-menu-item value="one">Option 1</mud-menu-item>
        <mud-menu-item value="two">Option 2</mud-menu-item>
        <mud-menu-item value="three">Option 3</mud-menu-item>
      </mud-menu>
    `,
  }),
};

export const Basic: Story = example(MenuBasicExample, basicSource);
export const Selection: Story = example(MenuSelectionExample, selectionSource);
export const Leading: Story = example(MenuLeadingExample, leadingSource);
export const Sections: Story = example(MenuSectionsExample, sectionsSource);
export const Nested: Story = example(MenuNestedExample, nestedSource);
export const Position: Story = example(MenuPositionExample, positionSource);
export const Mega: Story = example(MenuMegaExample, megaSource, {
  parameters: { layout: 'fullscreen' },
});
