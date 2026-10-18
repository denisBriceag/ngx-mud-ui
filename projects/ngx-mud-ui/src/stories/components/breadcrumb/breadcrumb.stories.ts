import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

interface PlaygroundArgs {
  maxVisible: number;
  label: string;
  overflowLabel: string;
  responsive: boolean;
}

const playgroundSource = (args: PlaygroundArgs): string => `import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-page-header',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: \`
    <nav mudBreadcrumb
      [maxVisible]="${args.maxVisible}"
      label="${args.label}"
      overflowLabel="${args.overflowLabel}"
      [responsive]="${args.responsive}">
      <ol>
        <li mudBreadcrumbItem><a href="/">Acasă</a></li>
        <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
        <li mudBreadcrumbItem><a href="/servicii/acte">Acte de identitate</a></li>
        <li mudBreadcrumbItem><a href="/servicii/acte/buletin">Buletin</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  \`,
})
export class PageHeaderComponent {}`;

const COLLAPSED_SOURCE = `import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-request-breadcrumb',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: \`
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="/">Acasă</a></li>
        <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
        <li mudBreadcrumbItem><a href="/servicii/acte">Acte</a></li>
        <li mudBreadcrumbItem><a href="/servicii/acte/buletin">Buletin</a></li>
        <li mudBreadcrumbItem><a href="/servicii/acte/buletin/cereri">Cereri</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  \`,
})
export class RequestBreadcrumbComponent {}`;

const TRUNCATED_SOURCE = `import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-directorate-breadcrumb',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: \`
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="/">Acasă</a></li>
        <li mudBreadcrumbItem>
          <a href="/directia">Direcția generală pentru eliberarea actelor de identitate</a>
        </li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  \`,
})
export class DirectorateBreadcrumbComponent {}`;

const STATES_SOURCE = `import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-states-breadcrumb',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: \`
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="/">Acasă</a></li>
        <li mudBreadcrumbItem disabled><a href="/indisponibil">Indisponibil</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  \`,
})
export class StatesBreadcrumbComponent {}`;

const NARROW_SOURCE = `import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-narrow-breadcrumb',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: \`
    <!-- The collapse to a back link is a container query on this wrapper, not
         a viewport media query — it fires whenever the wrapper itself is
         narrow, even on a wide screen. -->
    <div style="width:360px;border:1px dashed var(--mud-color-border-base-default);padding:12px">
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem><a href="/">Acasă</a></li>
          <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    </div>
  \`,
})
export class NarrowBreadcrumbComponent {}`;

const meta: Meta<MudBreadcrumb> = {
  title: 'Components/Breadcrumb',
  component: MudBreadcrumb,
  decorators: [moduleMetadata({ imports: [MudBreadcrumb, MudBreadcrumbItem] })],
  argTypes: {
    maxVisible: { control: { type: 'number', min: 2 } },
    label: { control: 'text' },
    overflowLabel: { control: 'text' },
    responsive: { control: 'boolean' },
  },
  args: {
    maxVisible: 4,
    label: 'Breadcrumb',
    overflowLabel: 'Show collapsed pages',
    responsive: true,
  },
};

export default meta;

type Story = StoryObj<MudBreadcrumb>;

/** Every input bound — drop maxVisible to 2 and watch the middle collapse. */
export const Playground: Story = {
  parameters: {
    // `transform`, not a static `code`: the snippet is rebuilt from the live
    // args, so changing a control updates the values shown below.
    docs: { source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) } },
  },
  render: (args) => ({
    props: args,
    template: `
      <nav mudBreadcrumb
        [maxVisible]="maxVisible"
        [label]="label"
        [overflowLabel]="overflowLabel"
        [responsive]="responsive">
        <ol>
          <li mudBreadcrumbItem><a href="/">Acasă</a></li>
          <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
          <li mudBreadcrumbItem><a href="/servicii/acte">Acte de identitate</a></li>
          <li mudBreadcrumbItem><a href="/servicii/acte/buletin">Buletin</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  }),
};

/** Six crumbs against the default limit of four: first + overflow + last two. */
export const Collapsed: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: COLLAPSED_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem><a href="/">Acasă</a></li>
          <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
          <li mudBreadcrumbItem><a href="/servicii/acte">Acte</a></li>
          <li mudBreadcrumbItem><a href="/servicii/acte/buletin">Buletin</a></li>
          <li mudBreadcrumbItem><a href="/servicii/acte/buletin/cereri">Cereri</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  }),
};

/** A label past 30 characters truncates; the full title lives in the tooltip. */
export const Truncated: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: TRUNCATED_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem><a href="/">Acasă</a></li>
          <li mudBreadcrumbItem>
            <a href="/directia">Direcția generală pentru eliberarea actelor de identitate</a>
          </li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  }),
};

/** Active and disabled crumbs side by side. */
export const States: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: STATES_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem><a href="/">Acasă</a></li>
          <li mudBreadcrumbItem disabled><a href="/indisponibil">Indisponibil</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  }),
};

/**
 * The collapse is a container query, so it fires on the 360px wrapper even on a
 * desktop viewport. Changing the Storybook viewport toolbar will NOT trigger it.
 */
export const Narrow: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: NARROW_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `
      <div style="width:360px;border:1px dashed var(--mud-color-border-base-default);padding:12px">
        <nav mudBreadcrumb>
          <ol>
            <li mudBreadcrumbItem><a href="/">Acasă</a></li>
            <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
            <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
          </ol>
        </nav>
      </div>
    `,
  }),
};
