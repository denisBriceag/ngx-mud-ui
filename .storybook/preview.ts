import type { Decorator, Preview, StoryContext } from '@storybook/angular-vite';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { createElement, useEffect as useReactEffect, useState, type PropsWithChildren } from 'react';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { emitTransformCode, useEffect } from 'storybook/preview-api';
import { themes } from 'storybook/theming';

import { extractArgTypes } from './compodoc-argtypes';

import docJson from '../documentation.json';

// Structural styles for CDK overlays.
import '@angular/cdk/overlay-prebuilt.css';
import '../projects/ngx-mud-ui/styles/prebuilt/mud.scss';
// The dark theme is opt-in for apps; Storybook always loads it so every story works with the Theme toolbar.
import '../projects/ngx-mud-ui/styles/prebuilt/mud-dark.scss';
import './docs-chrome.scss';

setCompodocJson(docJson);

// Theme must live on the ROOT element — nested data-theme wrappers don't
// re-resolve the chained --color-* tokens (see Foundations/Dark Mode).
const applyTheme = (theme: unknown): void => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

const withTheme: Decorator = (story, context) => {
  applyTheme(context.globals['theme']);

  return story();
};

/**
 * Docs pages follow the Theme toolbar too, including pages without stories (Introduction,
 * Foundations), where no decorator runs.
 */
const ThemedDocsContainer = ({ context, children }: PropsWithChildren<DocsContainerProps>) => {
  const [theme, setTheme] = useState<unknown>(
    () => (context as unknown as { store: { userGlobals: { get(): Record<string, unknown> } } })
      .store.userGlobals.get()['theme'],
  );

  useReactEffect(() => {
    const update = ({ globals }: { globals: Record<string, unknown> }) => setTheme(globals['theme']);

    context.channel.on(GLOBALS_UPDATED, update);

    return () => context.channel.off(GLOBALS_UPDATED, update);
  }, [context]);

  applyTheme(theme);

  return createElement(
    DocsContainer,
    { context, theme: theme === 'dark' ? themes.dark : themes.light },
    children,
  );
};

/** What each Playground template actually renders with: args plus any extra props, such as `options`. */
const renderedProps = new Map<string, Record<string, unknown>>();

// Models can't take booleanAttribute, so a bare `checked` would bind the string "".
const MODEL_BOOLEANS = new Set(['checked', 'selected', 'open', 'collapsed']);

const unquote = (value: string): string => value.replace(/^'(.*)'$/, '$1');

/** The attribute a control's current value reads as, or '' when it adds nothing. */
const attribute = (input: string, value: unknown, fallback: string | undefined): string | null => {
  if (fallback !== undefined && unquote(fallback) === String(value)) return '';

  if (value === undefined || value === null || value === '') return '';

  if (value === true) return MODEL_BOOLEANS.has(input) ? `[${input}]="true"` : input;

  if (value === false) return fallback === 'true' ? `[${input}]="false"` : '';

  if (typeof value === 'string') return `${input}="${value.replace(/"/g, '&quot;')}"`;

  if (typeof value === 'number') return `[${input}]="${value}"`;

  return null;
};

/**
 * Playground templates bind every input to a control (`[size]="size"`), which reads as noise in
 * "Show code". This prints the current values instead, leaving out the defaults.
 */
const playgroundSource = (code: string, { id, args: controls, argTypes }: StoryContext): string => {
  if (!id.endsWith('--playground')) return code;

  const args = renderedProps.get(id) ?? controls;

  const resolved = code
    // Only sizes the Playground frame.
    .replace(/\s+style="display:\s*block;\s*max-width:\s*\d+px;?"/g, '')
    .replace(/(\s+)\[([\w.-]+)\]="(\w+)"/g, (match, space: string, input: string, name: string) => {
      // A control left unset is absent from the props but still listed in argTypes.
      if (!(name in args) && !(name in argTypes)) return match;

      const summary: unknown = argTypes[name]?.table?.defaultValue?.summary;
      const fallback = summary === undefined ? undefined : String(summary);
      const printed = attribute(input, args[name], fallback);

      if (printed === null) return match;

      return printed ? `${space}${printed}` : '';
    });

  // Rejoin an opening tag that now fits on one line.
  return resolved.replace(/<([a-z][\w-]*)([^<>]*)>/gi, (match, tag: string, attrs: string) => {
    if (!attrs.includes('\n')) return match;

    const parts = attrs.split(/\s*\n\s*/).filter(Boolean);
    const line = `<${tag}${parts.length ? ` ${parts.join(' ')}` : ''}>`;

    return line.length <= 80 ? line : match;
  });
};

// Angular's source decorator re-emits only when the template text changes, never on new args.
const withPlaygroundSource: Decorator = (storyFn, context) => {
  const story = storyFn();

  if (story.props) renderedProps.set(context.id, story.props);

  useEffect(() => {
    if (context.id.endsWith('--playground') && story.template)
      emitTransformCode(story.template, context);
  });

  return story;
};

const preview: Preview = {
  decorators: [withTheme, withPlaygroundSource],
  globalTypes: {
    theme: {
      description: 'Design-system color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    docs: {
      container: ThemedDocsContainer,
      extractArgTypes,
      source: { transform: playgroundSource },
    },
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Components', '*'] },
    },
    // The Theme toolbar owns the canvas background (via body tokens);
    // the Backgrounds picker would fight it.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
