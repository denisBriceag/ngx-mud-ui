import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';
import { document as documentIcon, idCard, provideMudIcons, wallet } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { AccordionAppearanceExample } from './examples/accordion-appearance.example';
import appearanceSource from './examples/accordion-appearance.example.ts?raw';
import { AccordionBasicExample } from './examples/accordion-basic.example';
import basicSource from './examples/accordion-basic.example.ts?raw';
import { AccordionControlledExample } from './examples/accordion-controlled.example';
import controlledSource from './examples/accordion-controlled.example.ts?raw';
import { AccordionDisabledExample } from './examples/accordion-disabled.example';
import disabledSource from './examples/accordion-disabled.example.ts?raw';
import { AccordionGroupExample } from './examples/accordion-group.example';
import groupSource from './examples/accordion-group.example.ts?raw';
import { AccordionIconExample } from './examples/accordion-icon.example';
import iconSource from './examples/accordion-icon.example.ts?raw';
import { AccordionLongContentExample } from './examples/accordion-long-content.example';
import longContentSource from './examples/accordion-long-content.example.ts?raw';
import { AccordionTrailingExample } from './examples/accordion-trailing.example';
import trailingSource from './examples/accordion-trailing.example.ts?raw';

const meta: Meta<MudAccordion> = {
  title: 'Components/Accordion',
  component: MudAccordion,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([documentIcon, idCard, wallet])] }),
    moduleMetadata({
      imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle, MudAccordionDescription],
    }),
  ],
  args: { hideToggle: false },
};

export default meta;

type Story = StoryObj<MudAccordion>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-accordion [hideToggle]="hideToggle" style="display:block;max-width:720px">
        <mud-accordion-header>
          <mud-accordion-title>Accordion heading</mud-accordion-title>
          <mud-accordion-description>Supporting text</mud-accordion-description>
        </mud-accordion-header>
        Conținutul accordionului. Poate fi text, liste, componente etc.
      </mud-accordion>
    `,
  }),
};

export const Basic: Story = example(AccordionBasicExample, basicSource);
export const Group: Story = example(AccordionGroupExample, groupSource);
export const Controlled: Story = example(AccordionControlledExample, controlledSource);
export const Disabled: Story = example(AccordionDisabledExample, disabledSource);
export const Appearance: Story = example(AccordionAppearanceExample, appearanceSource);
export const Icon: Story = example(AccordionIconExample, iconSource);
export const Trailing: Story = example(AccordionTrailingExample, trailingSource);
export const LongContent: Story = example(AccordionLongContentExample, longContentSource);
