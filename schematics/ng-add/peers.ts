import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chain } from '@angular-devkit/schematics';
import type { Rule } from '@angular-devkit/schematics';
import { addDependency, DependencyType, ExistingBehavior } from '@schematics/angular/utility';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/** @description Peer ranges from the shipped ngx-mud-ui package.json (two levels above schematics/ng-add). */
export function readLibraryPeers(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')) as PackageJson;

  return pkg.peerDependencies ?? {};
}

/** @description Peers the app lists in none of its dependency sections; installed ones are never re-versioned. */
export function missingPeers(peers: Record<string, string>, app: PackageJson): Record<string, string> {
  const installed = { ...app.peerDependencies, ...app.devDependencies, ...app.dependencies };

  return Object.fromEntries(Object.entries(peers).filter(([name]) => !(name in installed)));
}

/** @description Adds the missing peers to `dependencies` and schedules the install. */
export function addMissingPeers(report: (line: string) => void): Rule {
  return (tree) => {
    const missing = missingPeers(readLibraryPeers(), JSON.parse(tree.readText('/package.json')) as PackageJson);
    const entries = Object.entries(missing);

    if (!entries.length) report('all peer dependencies already installed');

    for (const [name, range] of entries) report(`added ${name}@${range}`);

    return chain(entries.map(([name, range]) => addDependency(name, range, { type: DependencyType.Default, existing: ExistingBehavior.Skip })));
  };
}
