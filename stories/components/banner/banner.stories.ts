import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudBanner } from 'ngx-mud-ui/banner';
import { alarm, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { BannerClosableExample } from './examples/banner-closable.example';
import closableSource from './examples/banner-closable.example.ts?raw';
import { BannerIconExample } from './examples/banner-icon.example';
import iconSource from './examples/banner-icon.example.ts?raw';
import { BannerLinksExample } from './examples/banner-links.example';
import linksSource from './examples/banner-links.example.ts?raw';
import { BannerLiveExample } from './examples/banner-live.example';
import liveSource from './examples/banner-live.example.ts?raw';
import { BannerVariantsExample } from './examples/banner-variants.example';
import variantsSource from './examples/banner-variants.example.ts?raw';

const meta: Meta<MudBanner> = {
  title: 'Components/Banner',
  component: MudBanner,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([alarm])] }),
    moduleMetadata({ imports: [MudBanner] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'warning', 'error'] },
    type: { control: 'inline-radio', options: ['subtle', 'strong'] },
  },
  args: { variant: 'info', type: 'subtle', closable: false },
};

export default meta;

type Story = StoryObj<MudBanner>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-banner [variant]="variant" [type]="type" [closable]="closable">
        Scheduled maintenance tonight 22:00–00:00.
      </mud-banner>
    `,
  }),
};

export const Variants: Story = example(BannerVariantsExample, variantsSource);
export const Icon: Story = example(BannerIconExample, iconSource);
export const Links: Story = example(BannerLinksExample, linksSource);
export const Closable: Story = example(BannerClosableExample, closableSource);
export const Live: Story = example(BannerLiveExample, liveSource);
