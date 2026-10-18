import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
import type { MudIcon } from 'ngx-mud-ui/icons';
// Deep import on purpose: the data barrel contains only icon objects, so
// Object.values() enumerates icons without sweeping in the component/provider
// exports of the public API.
import * as iconData from '../../../../icons/src/lib/data';

const ALL_ICONS = Object.values(iconData) as MudIcon[];
const ICON_NAMES = ALL_ICONS.map((icon) => icon.name).sort();

const meta: Meta<MudIconComponent> = {
  title: 'Components/MudIcon',
  component: MudIconComponent,
  decorators: [
    applicationConfig({ providers: [provideMudIcons(ALL_ICONS)] }),
    moduleMetadata({ imports: [MudIconComponent] }),
  ],
  argTypes: {
    name: {
      control: 'select',
      options: ICON_NAMES,
      description: 'Icon name (kebab-case). All icons are registered in this playground.',
    },
    variant: { control: 'inline-radio', options: ['outlined', 'filled'] },
    scale: { control: 'inline-radio', options: [12, 16, 20, 24] },
    ariaLabel: {
      name: 'aria-label',
      control: 'text',
      description: 'Accessible label. Leave empty for a decorative icon (aria-hidden).',
    },
  },
  args: {
    name: 'alarm',
    variant: 'outlined',
    scale: 24,
    ariaLabel: '',
  },
  // The `ariaLabel` arg is renamed to `ariaLabelText` before it reaches the
  // template props: Storybook's Angular wrapper assigns any prop whose key is
  // not an input TEMPLATE name (here the alias "aria-label") directly onto
  // the component instance, and `instance.ariaLabel = '...'` would overwrite
  // the input signal and crash the host bindings ("ctx.ariaLabel is not a
  // function").
  render: ({ ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="display:inline-flex;align-items:center;gap:1rem;padding:1.5rem;color:var(--mud-color-icon-base-default, #121212);font-family:monospace">
        <mud-icon [name]="name" [variant]="variant" [scale]="scale" [aria-label]="ariaLabelText" />
        <span>&lt;mud-icon name="{{ name }}" variant="{{ variant }}" scale="{{ scale }}" /&gt;</span>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<MudIconComponent>;

export const Playground: Story = {};
