import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import {
  EgovAccordion,
  EgovAccordionDescription,
  EgovAccordionGroup,
  EgovAccordionHeader,
  EgovAccordionTitle,
} from '../../../accordion/src/public-api';

const WRAP = 'max-width:720px;padding:24px';

const meta: Meta<EgovAccordion> = {
  title: 'Components/Accordion',
  component: EgovAccordion,
  decorators: [
    moduleMetadata({
      imports: [EgovAccordionGroup, EgovAccordion, EgovAccordionHeader, EgovAccordionTitle, EgovAccordionDescription],
    }),
  ],
  argTypes: {
    expanded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hideToggle: { control: 'boolean' },
  },
  args: {
    expanded: false,
    disabled: false,
    hideToggle: false,
  },
};

export default meta;

type Story = StoryObj<EgovAccordion>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${WRAP}">
        <egov-accordion
          [expanded]="expanded"
          [disabled]="disabled"
          [hideToggle]="hideToggle"
        >
          <egov-accordion-header>
            <egov-accordion-title>Accordion Heading</egov-accordion-title>
            <egov-accordion-description>Supporting Text</egov-accordion-description>
          </egov-accordion-header>
          Conținutul accordionului. Poate fi text, liste, componente etc.
        </egov-accordion>
      </div>
    `,
  }),
};

/**
 * The group draws the separators and coordinates panels. With the default
 * `multi=true` panels expand independently; set `multi=false` so opening one
 * closes the others. Up/Down/Home/End move focus between the headers.
 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <egov-accordion-group>
          <egov-accordion>
            <egov-accordion-header>
              <egov-accordion-title>Accordion Heading</egov-accordion-title>
              <egov-accordion-description>Supporting Text</egov-accordion-description>
            </egov-accordion-header>
            Conținutul accordionului. Poate fi text, liste, componente etc.
          </egov-accordion>
          <egov-accordion>
            <egov-accordion-header>
              <egov-accordion-title>Second section</egov-accordion-title>
              <egov-accordion-description>Supporting Text</egov-accordion-description>
            </egov-accordion-header>
            Conținutul accordionului. Poate fi text, liste, componente etc.
          </egov-accordion>
          <egov-accordion>
            <egov-accordion-header>
              <egov-accordion-title>Title only, no description</egov-accordion-title>
            </egov-accordion-header>
            Conținutul accordionului.
          </egov-accordion>
        </egov-accordion-group>
      </div>
    `,
  }),
};

/** With `multi=false`, expanding a panel collapses its siblings. */
export const SingleOpen: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <egov-accordion-group [multi]="false">
          <egov-accordion>
            <egov-accordion-header>
              <egov-accordion-title>First</egov-accordion-title>
            </egov-accordion-header>
            First panel content.
          </egov-accordion>
          <egov-accordion>
            <egov-accordion-header>
              <egov-accordion-title>Second</egov-accordion-title>
            </egov-accordion-header>
            Second panel content.
          </egov-accordion>
        </egov-accordion-group>
      </div>
    `,
  }),
};

/**
 * Disabled panels stay in the tab order with aria-disabled="true" so
 * screen-reader and keyboard users can still discover them; activation is
 * ignored and the text uses the disabled tokens.
 */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <egov-accordion [disabled]="true">
          <egov-accordion-header>
            <egov-accordion-title>Disabled section</egov-accordion-title>
            <egov-accordion-description>Cannot be expanded</egov-accordion-description>
          </egov-accordion-header>
          Hidden content.
        </egov-accordion>
      </div>
    `,
  }),
};
