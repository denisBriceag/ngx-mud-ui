import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { provideMudIcons, signature } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { ToastActionsExample } from './examples/toast-actions.example';
import actionsSource from './examples/toast-actions.example.ts?raw';
import { ToastComponentExample } from './examples/toast-component.example';
import componentSource from './examples/toast-component.example.ts?raw';
import { ToastDialogExample } from './examples/toast-dialog.example';
import dialogSource from './examples/toast-dialog.example.ts?raw';
import { ToastOverDialogExample } from './examples/toast-over-dialog.example';
import overDialogSource from './examples/toast-over-dialog.example.ts?raw';
import { ToastPersistentExample } from './examples/toast-persistent.example';
import persistentSource from './examples/toast-persistent.example.ts?raw';
import { ToastPositionExample } from './examples/toast-position.example';
import positionSource from './examples/toast-position.example.ts?raw';
import { ToastVariantsExample } from './examples/toast-variants.example';
import variantsSource from './examples/toast-variants.example.ts?raw';

const meta: Meta = {
  title: 'Components/Toast',
  decorators: [applicationConfig({ providers: [provideMudIcons([signature])] })],
};

export default meta;

type Story = StoryObj;

export const Variants: Story = example(ToastVariantsExample, variantsSource);
export const Position: Story = example(ToastPositionExample, positionSource);
export const Dialog: Story = example(ToastDialogExample, dialogSource, {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Trimite cererea' }));

    // Overlays render outside canvasElement (CDK overlay container under <body>).
    await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeTruthy());
    const dialog = document.querySelector('mud-dialog-container') as HTMLElement;

    await expect(document.querySelector('.mud-toast')).toBeNull();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Trimite' }));
    await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeNull());
    await waitFor(() => expect(document.querySelector('.mud-toast')).toBeTruthy());

    // Canvas must rest.
    await userEvent.click(document.querySelector('.mud-toast__close') as HTMLButtonElement);
    await waitFor(() => expect(document.querySelector('.mud-toast')).toBeNull());
  },
});

/** Test-only: a toast opened before a dialog still stacks above it. */
// Tags must be a literal on the story: the indexer can't read them through example().
export const OverDialog: Story = {
  tags: ['!dev'],
  ...example(ToastOverDialogExample, overDialogSource, {
    play: async ({ canvasElement }) => {
      await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save and submit' }));

      // Overlays render outside canvasElement (CDK overlay container under <body>).
      await waitFor(() => expect(document.querySelector('.mud-toast')).toBeTruthy());
      const toast = document.querySelector('.mud-toast') as HTMLElement;
      // Captured while the slide-in still runs (the dialog opens once it ends); a replay would create new animations.
      const enter = toast.getAnimations();

      await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeTruthy());
      const dialog = document.querySelector('mud-dialog-container') as HTMLElement;

      await Promise.all(
        dialog.getAnimations({ subtree: true }).map((animation) => animation.finished),
      );
      const box = toast.getBoundingClientRect();
      const topmost = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

      // The toast, not the dialog's backdrop, is what the user sees and clicks.
      await expect(toast.contains(topmost)).toBe(true);
      await expect(
        toast.getAnimations().filter((animation) => !enter.includes(animation)),
      ).toHaveLength(0);

      // Canvas must rest: close the dialog, then the toast.
      await userEvent.click(within(dialog).getByRole('button', { name: 'Trimite' }));
      await waitFor(() => expect(document.querySelector('mud-dialog-container')).toBeNull());
      await userEvent.click(toast.querySelector('.mud-toast__close') as HTMLButtonElement);
      await waitFor(() => expect(document.querySelector('.mud-toast')).toBeNull());
    },
  }),
};
export const Persistent: Story = example(ToastPersistentExample, persistentSource);
export const Actions: Story = example(ToastActionsExample, actionsSource);
export const Component: Story = example(ToastComponentExample, componentSource);
