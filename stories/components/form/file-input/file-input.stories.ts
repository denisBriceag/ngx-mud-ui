import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { image, pdfFile, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudLabel } from 'ngx-mud-ui/label';

import { example } from '../../../example';
import { FileInputBasicExample } from './examples/file-input-basic.example';
import basicSource from './examples/file-input-basic.example.ts?raw';
import { FileInputReactiveExample } from './examples/file-input-reactive.example';
import reactiveSource from './examples/file-input-reactive.example.ts?raw';
import { FileInputSignalFormsExample } from './examples/file-input-signal-forms.example';
import signalFormsSource from './examples/file-input-signal-forms.example.ts?raw';
import { FileInputItemsExample } from './examples/file-input-items.example';
import itemsSource from './examples/file-input-items.example.ts?raw';
import { FileInputUploadExample } from './examples/file-input-upload.example';
import uploadSource from './examples/file-input-upload.example.ts?raw';
import { FileInputVariantsExample } from './examples/file-input-variants.example';
import variantsSource from './examples/file-input-variants.example.ts?raw';

const meta: Meta<MudFileInput> = {
  title: 'Components/Form/File input',
  component: MudFileInput,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([pdfFile, image])] }),
    moduleMetadata({ imports: [MudFileInput, MudLabel] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['dropzone', 'button'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
  args: {
    variant: 'dropzone',
    size: 'md',
    multiple: true,
    accept: '.pdf,image/*',
    maxSize: 5242880,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudFileInput>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-file-input
        style="display:block;max-width:520px"
        [variant]="variant"
        [size]="size"
        [multiple]="multiple"
        [accept]="accept"
        [maxSize]="maxSize"
        [disabled]="disabled"
        [invalid]="invalid"
      >
        <mud-label>Documente</mud-label>
      </mud-file-input>
    `,
  }),
};

export const Basic: Story = example(FileInputBasicExample, basicSource);
export const Variants: Story = example(FileInputVariantsExample, variantsSource);
export const ReactiveForms: Story = example(FileInputReactiveExample, reactiveSource);
export const SignalForms: Story = example(FileInputSignalFormsExample, signalFormsSource);
export const Items: Story = example(FileInputItemsExample, itemsSource);
export const Upload: Story = example(FileInputUploadExample, uploadSource);
