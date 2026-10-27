import type { JsonValue } from '@angular-devkit/core';
import type { Rule } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility';

/** @description An `angular.json` styles entry. */
export type StyleEntry = string | { input: string; [key: string]: unknown };

const OVERLAY = '@angular/cdk/overlay-prebuilt.css';
const MUD = 'ngx-mud-ui/prebuilt/mud.css';
const DARK = 'ngx-mud-ui/prebuilt/mud-dark.css';

/** @description Library stylesheets in load order. */
export function libraryStyles(darkMode: boolean): string[] {
  return darkMode ? [OVERLAY, MUD, DARK] : [OVERLAY, MUD];
}

/** @description The entry's path with `./` and `node_modules/` stripped, so a manual setup matches the specifier. */
export function stylePath(entry: StyleEntry): string {
  const path = typeof entry === 'string' ? entry : entry.input;

  return path.replace(/^\.\//, '').replace(/^node_modules\//, '');
}

/** @description Inserts the missing library entries before the app's own styles, keeping existing entries untouched. */
export function mergeLibraryStyles(existing: readonly StyleEntry[], wanted: readonly string[]): { styles: StyleEntry[]; added: string[] } {
  const styles = [...existing];
  const added: string[] = [];

  wanted.forEach((specifier, i) => {
    if (styles.some((entry) => stylePath(entry) === specifier)) return;

    let at = 0;

    for (const previous of wanted.slice(0, i)) {
      const index = styles.findIndex((entry) => stylePath(entry) === previous);

      if (index >= 0) at = index + 1;
    }

    styles.splice(at, 0, specifier);
    added.push(specifier);
  });

  return { styles, added };
}

/** @description Karma test targets take styles; the vitest unit-test builder inherits them from its build target. */
export function testTargetPolicy(builder: string | undefined): 'add' | 'covered' | 'skip' {
  if (builder?.endsWith(':karma')) return 'add';

  if (builder?.endsWith(':unit-test')) return 'covered';

  return 'skip';
}

/** @description Adds the library stylesheets to the project's build (and Karma test) target. */
export function addLibraryStyles(projectName: string, darkMode: boolean, report: (line: string) => void): Rule {
  return updateWorkspace((workspace) => {
    const targets = workspace.projects.get(projectName)?.targets;
    const wanted = libraryStyles(darkMode);

    const merge = (targetName: string) => {
      const target = targets?.get(targetName);

      if (!target) return false;

      target.options ??= {};
      const { styles, added } = mergeLibraryStyles((target.options['styles'] as StyleEntry[] | undefined) ?? [], wanted);

      target.options['styles'] = styles as JsonValue;
      report(added.length ? `${targetName}: added ${added.join(', ')}` : `${targetName}: styles already set up`);

      return true;
    };

    if (!merge('build')) report('build: skipped (no build target)');

    const policy = testTargetPolicy(targets?.get('test')?.builder);

    if (policy === 'add') merge('test');
    else if (policy === 'covered') report('test: covered by build');
    else report('test: skipped (no test target or unsupported builder)');
  });
}
