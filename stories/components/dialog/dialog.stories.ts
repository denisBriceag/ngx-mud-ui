import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { example } from '../../example';
import { DialogConfirmExample } from './examples/dialog-confirm.example';
import confirmSource from './examples/dialog-confirm.example.ts?raw';
import { DialogDataExample } from './examples/dialog-data.example';
import dataSource from './examples/dialog-data.example.ts?raw';
import { DialogImageExample } from './examples/dialog-image.example';
import imageSource from './examples/dialog-image.example.ts?raw';
import { DialogLongContentExample } from './examples/dialog-long-content.example';
import longContentSource from './examples/dialog-long-content.example.ts?raw';
import { DialogSizesExample } from './examples/dialog-sizes.example';
import sizesSource from './examples/dialog-sizes.example.ts?raw';
import { DialogTemplateExample } from './examples/dialog-template.example';
import templateSource from './examples/dialog-template.example.ts?raw';

const meta: Meta = {
  title: 'Components/Dialog',
};

export default meta;

type Story = StoryObj;

export const Confirm: Story = example(DialogConfirmExample, confirmSource, {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete document' }));

    // The dialog renders in a CDK overlay under <body>, outside canvasElement.
    const dialog = document.querySelector('[role="dialog"]');
    const title = document.querySelector('.dialog__title');

    await expect(dialog).toBeTruthy();
    await expect(dialog?.getAttribute('aria-labelledby')).toBe(title?.id);

    // Canvas must rest: close the dialog before the play ends.
    await userEvent.click(within(dialog as HTMLElement).getByRole('button', { name: 'Anulează' }));
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
});
export const Data: Story = example(DialogDataExample, dataSource);
export const Sizes: Story = example(DialogSizesExample, sizesSource);
export const Image: Story = example(DialogImageExample, imageSource, {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open welcome dialog' }),
    );

    // Stacked buttons must fill the footer's content box (the base .mud-btn max-width once capped them).
    // Rects include the enter animation's scale, so wait for it to land first.
    const card = document.querySelector('.dialog') as HTMLElement;

    await Promise.all(card.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const actions = document.querySelector('.dialog__actions--stacked') as HTMLElement;
    const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>('button'));
    const styles = getComputedStyle(actions);
    const contentWidth =
      actions.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);

    await expect(buttons.length).toBe(2);

    for (const button of buttons) {
      await expect(Math.abs(button.getBoundingClientRect().width - contentWidth)).toBeLessThan(1);
    }

    // Canvas must rest: close the dialog before the play ends.
    await userEvent.click(buttons.find((button) => button.textContent?.includes('Mai târziu'))!);
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
});
export const LongContent: Story = example(DialogLongContentExample, longContentSource);
export const Template: Story = example(DialogTemplateExample, templateSource);
