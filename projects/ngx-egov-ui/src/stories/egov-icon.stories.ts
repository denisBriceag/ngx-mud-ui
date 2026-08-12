import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { EgovIconComponent, provideEgovIcons } from '../../icons/src/public-api';
import type { EgovIcon } from '../../icons/src/lib/types';
import * as iconData from '../../icons/src/lib/data';

const ALL_ICONS = Object.values(iconData) as EgovIcon[];
const ICON_NAMES = ALL_ICONS.map((icon) => icon.name).sort();

const meta: Meta<EgovIconComponent> = {
  title: 'Components/EgovIcon',
  component: EgovIconComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideEgovIcons(ALL_ICONS)] }),
    moduleMetadata({ imports: [EgovIconComponent] }),
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
  render: (args) => ({
    props: args,
    template: `
      <div style="display:inline-flex;align-items:center;gap:1rem;padding:1.5rem;color:#121212;font-family:monospace">
        <egov-icon [name]="name" [variant]="variant" [scale]="scale" [aria-label]="ariaLabel" />
        <span>&lt;egov-icon name="{{ name }}" variant="{{ variant }}" scale="{{ scale }}" /&gt;</span>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<EgovIconComponent>;

export const Playground: Story = {};
