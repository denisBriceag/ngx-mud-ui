import { HostTree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import { describe, expect, it } from 'vitest';

import { resolveProject } from '../ng-add/project';

async function workspaceWith(projects: Record<string, 'application' | 'library'>) {
  const tree = new HostTree();
  const entries = Object.entries(projects).map(([name, projectType]) => [name, { root: `projects/${name}`, projectType }]);

  tree.create('/angular.json', JSON.stringify({ version: 1, projects: Object.fromEntries(entries) }));

  return readWorkspace(tree);
}

describe('resolveProject', () => {
  it('returns a requested application', async () => {
    expect(resolveProject(await workspaceWith({ admin: 'application', portal: 'application' }), 'portal')).toBe('portal');
  });

  it('rejects an unknown project', async () => {
    const ws = await workspaceWith({ app: 'application' });

    expect(() => resolveProject(ws, 'x')).toThrow('Project "x" does not exist. Applications: app. Rerun with --project <name>.');
  });

  it('rejects a library', async () => {
    const ws = await workspaceWith({ app: 'application', lib: 'library' });

    expect(() => resolveProject(ws, 'lib')).toThrow(
      'Project "lib" is not an application. Applications: app. Rerun with --project <name>.',
    );
  });

  it('picks the only application when nothing is requested', async () => {
    expect(resolveProject(await workspaceWith({ app: 'application', lib: 'library' }), undefined)).toBe('app');
  });

  it('asks for --project when several applications exist', async () => {
    const ws = await workspaceWith({ admin: 'application', portal: 'application' });

    expect(() => resolveProject(ws, undefined)).toThrow(
      'Several applications found: admin, portal. Rerun with --project <name>.',
    );
  });

  it('fails when the workspace has no application', async () => {
    const ws = await workspaceWith({ lib: 'library' });

    expect(() => resolveProject(ws, undefined)).toThrow(
      'No application project found in this workspace.',
    );
  });
});
