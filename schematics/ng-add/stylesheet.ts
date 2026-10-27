import type { Rule } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';

import { libraryStyles, stylePath } from './styles';
import type { StyleEntry } from './styles';

const FONT_TOKEN = '--mud-font-family-base';

/** @description The app's own global stylesheet: the first existing, non-library css/scss/sass/less entry. */
export function findGlobalStylesheet(styles: readonly StyleEntry[], exists: (path: string) => boolean): string | null {
  const library = libraryStyles(true);

  for (const entry of styles) {
    const path = typeof entry === 'string' ? entry : entry.input;

    if (!/\.(css|scss|sass|less)$/.test(path) || library.includes(stylePath(entry)) || /^(\.\/)?node_modules\//.test(path)) continue;

    if (exists(path)) return path;
  }

  return null;
}

/** @description The body font rule in the stylesheet's syntax. */
export function bodyRule(path: string): string {
  return path.endsWith('.sass')
    ? `body\n  font-family: var(${FONT_TOKEN})\n  font-size: 1rem\n`
    : `body {\n  font-family: var(${FONT_TOKEN});\n  font-size: 1rem;\n}\n`;
}

/** @description Content with the rule appended, or null when the font is already set. */
export function appendBodyRule(content: string, path: string): string | null {
  if (content.includes(FONT_TOKEN)) return null;

  if (content.trim() === '') return bodyRule(path);

  return `${content.replace(/\n*$/, '')}\n\n${bodyRule(path)}`;
}

/** @description Puts the library font on the page through the app's global stylesheet. */
export function addBodyFont(projectName: string, report: (line: string) => void): Rule {
  return async (tree) => {
    const workspace = await readWorkspace(tree);
    const styles = (workspace.projects.get(projectName)?.targets.get('build')?.options?.['styles'] as StyleEntry[] | undefined) ?? [];
    const path = findGlobalStylesheet(styles, (p) => tree.exists(p));

    if (!path) {
      report('no global stylesheet found — add the body rule yourself');

      return;
    }

    const updated = appendBodyRule(tree.readText(path), path);

    if (updated === null) {
      report(`body font already set in ${path}`);

      return;
    }

    tree.overwrite(path, updated);
    report(`added body font to ${path}`);
  };
}
