import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import type { MudIcon } from 'ngx-mud-ui/icons';
import { MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
// Deep import on purpose: the data barrel holds only icon objects, so Object.values() lists every icon.
import * as iconData from '../../../projects/ngx-mud-ui/icons/src/lib/data';

import { example } from '../../example';
import { IconBasicExample } from './examples/icon-basic.example';
import basicSource from './examples/icon-basic.example.ts?raw';
import { IconColorExample } from './examples/icon-color.example';
import colorSource from './examples/icon-color.example.ts?raw';
import { IconGalleryComponent } from './icon-gallery.component';

const ALL_ICONS = Object.values(iconData) as MudIcon[];

const meta: Meta<MudIconComponent> = {
  title: 'Components/Icons',
  component: MudIconComponent,
  decorators: [
    applicationConfig({ providers: [provideMudIcons(ALL_ICONS)] }),
    moduleMetadata({ imports: [MudIconComponent] }),
  ],
  argTypes: {
    name: { control: 'select', options: ALL_ICONS.map((icon) => icon.name).sort() },
    variant: { control: 'inline-radio', options: ['outlined', 'filled'] },
    scale: { control: 'inline-radio', options: [12, 16, 20, 24, 32] },
  },
  args: { name: 'alarm', variant: 'outlined', scale: 24 },
};

export default meta;

type Story = StoryObj<MudIconComponent>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<mud-icon [name]="name" [variant]="variant" [scale]="scale" />`,
  }),
};

export const Basic: Story = example(IconBasicExample, basicSource);
export const Color: Story = example(IconColorExample, colorSource);

// Every icon, grouped by variant. Only `scale` is live: icons not drawn at that size show their nearest drawing.
export const Gallery: Story = {
  parameters: { layout: 'fullscreen', controls: { include: ['scale'] } },
  decorators: [moduleMetadata({ imports: [IconGalleryComponent] })],
  render: ({ scale }) => ({
    props: { icons: ALL_ICONS, scale },
    template: `<mud-icon-gallery [icons]="icons" [scale]="scale" />`,
  }),
};
