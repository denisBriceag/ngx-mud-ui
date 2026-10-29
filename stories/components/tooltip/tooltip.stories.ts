import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudButton } from 'ngx-mud-ui/button';
import { circleInfo, download, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

import { example } from '../../example';
import { TooltipBasicExample } from './examples/tooltip-basic.example';
import basicSource from './examples/tooltip-basic.example.ts?raw';
import { TooltipCoachExample } from './examples/tooltip-coach.example';
import coachSource from './examples/tooltip-coach.example.ts?raw';
import { TooltipIconExample } from './examples/tooltip-icon.example';
import iconSource from './examples/tooltip-icon.example.ts?raw';
import { TooltipInteractiveExample } from './examples/tooltip-interactive.example';
import interactiveSource from './examples/tooltip-interactive.example.ts?raw';
import { TooltipPlacementsExample } from './examples/tooltip-placements.example';
import placementsSource from './examples/tooltip-placements.example.ts?raw';
import { TooltipTriggersExample } from './examples/tooltip-triggers.example';
import triggersSource from './examples/tooltip-triggers.example.ts?raw';

const meta: Meta<MudTooltip> = {
  title: 'Components/Tooltip',
  component: MudTooltip,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([download, circleInfo])] }),
    moduleMetadata({ imports: [MudButton, MudTooltip] }),
  ],
  argTypes: {
    tooltipPlacement: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'left-top',
        'left-center',
        'left-bottom',
        'right-top',
        'right-center',
        'right-bottom',
      ],
    },
    tooltipSize: { control: 'inline-radio', options: ['small', 'large'] },
    tooltipTrigger: { control: 'inline-radio', options: ['hover', 'click', 'focus'] },
    tooltipVariant: { control: 'inline-radio', options: ['default', 'coach'] },
  },
  args: {
    mudTooltip: 'The draft is saved every minute.',
    tooltipPlacement: 'top-center',
    tooltipSize: 'small',
    tooltipTrigger: 'hover',
    tooltipVariant: 'default',
    tooltipClosable: false,
  },
};

export default meta;

type Story = StoryObj<MudTooltip>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:72px 0;text-align:center">
        <button
          type="button"
          mudButton="outlined"
          [mudTooltip]="mudTooltip"
          [tooltipPlacement]="tooltipPlacement"
          [tooltipSize]="tooltipSize"
          [tooltipTrigger]="tooltipTrigger"
          [tooltipVariant]="tooltipVariant"
          [tooltipClosable]="tooltipClosable"
        >
          Save draft
        </button>
      </div>
    `,
  }),
};

export const Basic: Story = example(TooltipBasicExample, basicSource);
export const Placements: Story = example(TooltipPlacementsExample, placementsSource);
export const Icon: Story = example(TooltipIconExample, iconSource);
export const Triggers: Story = example(TooltipTriggersExample, triggersSource);
export const Interactive: Story = example(TooltipInteractiveExample, interactiveSource);
export const Coach: Story = example(TooltipCoachExample, coachSource);
