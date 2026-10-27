import { SchematicsException } from '@angular-devkit/schematics';
import type { workspaces } from '@angular-devkit/core';

/** @description Picks the application ng-add sets up; `requested` already carries the CLI's cwd-project default. */
export function resolveProject(workspace: workspaces.WorkspaceDefinition, requested: string | undefined): string {
  const apps = [...workspace.projects.entries()].filter(([, p]) => p.extensions['projectType'] === 'application').map(([name]) => name);

  const hint = `Applications: ${apps.join(', ')}. Rerun with --project <name>.`;

  if (requested !== undefined) {
    const project = workspace.projects.get(requested);

    if (!project) throw new SchematicsException(`Project "${requested}" does not exist. ${hint}`);

    if (project.extensions['projectType'] !== 'application') throw new SchematicsException(`Project "${requested}" is not an application. ${hint}`);

    return requested;
  }

  if (apps.length === 1) return apps[0];

  if (apps.length === 0) throw new SchematicsException('No application project found in this workspace.');

  throw new SchematicsException(`Several applications found: ${apps.join(', ')}. Rerun with --project <name>.`);
}
