import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudButton } from 'ngx-mud-ui/button';
import { chevronBottom, plusLarge, plusSmall, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { ButtonBasicExample } from './examples/button-basic.example';
import basicSource from './examples/button-basic.example.ts?raw';
import { ButtonDisabledExample } from './examples/button-disabled.example';
import disabledSource from './examples/button-disabled.example.ts?raw';
import { ButtonFullWidthExample } from './examples/button-full-width.example';
import fullWidthSource from './examples/button-full-width.example.ts?raw';
import { ButtonIconsExample } from './examples/button-icons.example';
import iconsSource from './examples/button-icons.example.ts?raw';
import { ButtonLinkExample } from './examples/button-link.example';
import linkSource from './examples/button-link.example.ts?raw';
import { ButtonLoadingExample } from './examples/button-loading.example';
import loadingSource from './examples/button-loading.example.ts?raw';
import { ButtonPlatformExample } from './examples/button-platform.example';
import platformSource from './examples/button-platform.example.ts?raw';
import { ButtonSizesExample } from './examples/button-sizes.example';
import sizesSource from './examples/button-sizes.example.ts?raw';
import { ButtonVariantsExample } from './examples/button-variants.example';
import variantsSource from './examples/button-variants.example.ts?raw';

const meta: Meta<MudButton> = {
  title: 'Components/Button',
  component: MudButton,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([plusSmall, plusLarge, chevronBottom])] }),
    moduleMetadata({ imports: [MudButton] }),
  ],
  argTypes: {
    mudButton: { control: 'inline-radio', options: ['filled', 'outlined', 'text'] },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'strict', 'neutral', 'destructive'],
    },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
    shape: { control: 'inline-radio', options: ['rectangular', 'circular'] },
  },
  args: {
    mudButton: 'filled',
    color: 'primary',
    size: 'large',
    shape: 'rectangular',
    fullWidth: false,
    disabled: false,
    loading: false,
  },
};

export default meta;

type Story = StoryObj<MudButton>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <button
        type="button"
        [mudButton]="mudButton"
        [color]="color"
        [size]="size"
        [shape]="shape"
        [fullWidth]="fullWidth"
        [disabled]="disabled"
        [loading]="loading"
      >
        Button
      </button>
    `,
  }),
};

export const Basic: Story = example(ButtonBasicExample, basicSource);
export const Variants: Story = example(ButtonVariantsExample, variantsSource);
export const Sizes: Story = example(ButtonSizesExample, sizesSource);
export const Icons: Story = example(ButtonIconsExample, iconsSource);
export const Loading: Story = example(ButtonLoadingExample, loadingSource);
export const Disabled: Story = example(ButtonDisabledExample, disabledSource);
export const Link: Story = example(ButtonLinkExample, linkSource);
export const FullWidth: Story = example(ButtonFullWidthExample, fullWidthSource);
export const Platform: Story = example(ButtonPlatformExample, platformSource);
