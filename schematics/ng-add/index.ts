import { chain } from '@angular-devkit/schematics';
import type { Rule } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';

import { addMissingPeers } from './peers';
import { resolveProject } from './project';
import type { Schema } from './schema';
import { addBodyFont } from './stylesheet';
import { addLibraryStyles } from './styles';

/** @description Entry point of `ng add ngx-mud-ui`. */
export function ngAdd(options: Schema): Rule {
  return async (tree) => {
    const project = resolveProject(await readWorkspace(tree), options.project);
    const lines: string[] = [];
    const report = (line: string) => lines.push(line);

    return chain([
      addMissingPeers(report),
      addLibraryStyles(project, options.darkMode ?? false, report),
      addBodyFont(project, report),
      (_, context) => {
        context.logger.info('ngx-mud-ui setup:');

        for (const line of lines) context.logger.info(`  ${line}`);

        if (options.darkMode) context.logger.info('Dark mode styles added — set data-theme="dark" on <html> to switch it on.');
      },
    ]);
  };
}
