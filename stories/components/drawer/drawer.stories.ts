import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { crossLarge, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { DrawerCookieExample } from './examples/drawer-cookie.example';
import cookieSource from './examples/drawer-cookie.example.ts?raw';
import { DrawerFiltersExample } from './examples/drawer-filters.example';
import filtersSource from './examples/drawer-filters.example.ts?raw';
import { DrawerPositionsExample } from './examples/drawer-positions.example';
import positionsSource from './examples/drawer-positions.example.ts?raw';
import { DrawerScrollingExample } from './examples/drawer-scrolling.example';
import scrollingSource from './examples/drawer-scrolling.example.ts?raw';

const meta: Meta = {
  title: 'Components/Drawer',
  decorators: [applicationConfig({ providers: [provideMudIcons([crossLarge])] })],
};

export default meta;

type Story = StoryObj;

export const Filters: Story = example(DrawerFiltersExample, filtersSource, {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filtre' }));

    // The drawer renders in a CDK overlay under <body>, outside canvasElement.
    const drawer = document.querySelector('[role="dialog"]') as HTMLElement;
    const title = drawer.querySelector('h2') as HTMLElement;

    await expect(drawer.classList.contains('drawer--right')).toBe(true);
    await expect(drawer.getAttribute('aria-labelledby')).toBe(title.id);

    // Canvas must rest: close before the play ends.
    await userEvent.click(drawer.querySelector('[aria-label="Închide"]') as HTMLButtonElement);
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
});
export const Positions: Story = example(DrawerPositionsExample, positionsSource);
export const Scrolling: Story = example(DrawerScrollingExample, scrollingSource, {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Read the terms' }));

    const drawer = document.querySelector('mud-drawer-container') as HTMLElement;
    const body = drawer.querySelector('.body') as HTMLElement;
    const actions = drawer.querySelector('footer') as HTMLElement;

    // Let the slide-in land before measuring (rects include the transform).
    await Promise.all(
      drawer.getAnimations({ subtree: true }).map((animation) => animation.finished),
    );
    const actionsTop = actions.getBoundingClientRect().top;

    // Keyboard users scroll it by focusing it: it must be a tab stop with a name.
    await expect(body.tabIndex).toBe(0);
    await expect(body.getAttribute('role')).toBe('region');
    await expect(body.getAttribute('aria-label')).toBeTruthy();

    // The body is the scroll region; the drawer itself must not scroll.
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(drawer.scrollHeight).toBe(drawer.clientHeight);

    body.scrollTop = body.scrollHeight;
    await expect(body.scrollTop).toBeGreaterThan(0);
    await expect(actions.getBoundingClientRect().top).toBe(actionsTop);
    await expect(actions.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);

    // Canvas must rest: close before the play ends.
    await userEvent.click(drawer.querySelector('[aria-label="Închide"]') as HTMLButtonElement);
    await expect(document.querySelector('mud-drawer-container')).toBeNull();
  },
});
export const Cookie: Story = example(DrawerCookieExample, cookieSource);
