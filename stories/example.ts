import type { Type } from '@angular/core';
import { reflectComponentType } from '@angular/core';
import type { StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

/**
 * A docs example: renders a standalone example component and shows its own file as the source,
 * so the code on the page is exactly the code that runs. Pair it with a `?raw` import:
 * `import basicSource from './examples/button-basic.example.ts?raw';`
 */
export function example(component: Type<unknown>, source: string, story: StoryObj = {}): StoryObj {
  const selector = reflectComponentType(component)?.selector;

  if (!selector) throw new Error(`${component.name} is not a component`);

  return {
    ...story,
    decorators: [
      moduleMetadata({ imports: [component] }),
      ...(story.decorators ? [story.decorators].flat() : []),
    ],
    parameters: {
      controls: { disable: true },
      ...story.parameters,
      docs: { ...story.parameters?.['docs'], source: { code: source, language: 'ts' } },
    },
    render: () => ({ template: `<${selector} />` }),
  };
}
