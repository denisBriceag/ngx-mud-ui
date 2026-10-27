import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error untyped build script
import { buildSchematics } from '../../tools/build-schematics.mjs';

const OUT = 'tools/__out__/schematics-pkg';

let runner: SchematicTestRunner;

async function createApp(names: string[] = ['app']): Promise<UnitTestTree> {
  let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '22.2.0',
  });

  for (const name of names) {
    tree = await runner.runExternalSchematic('@schematics/angular', 'application', { name, style: 'scss', skipTests: false }, tree);
  }

  return tree;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

function angularJson(tree: UnitTestTree): Json {
  return JSON.parse(tree.readContent('/angular.json'));
}

function editAngularJson(tree: UnitTestTree, edit: (json: Json) => void): void {
  const json = angularJson(tree);

  edit(json);
  tree.overwrite('/angular.json', JSON.stringify(json, null, 2));
}

beforeAll(() => {
  buildSchematics({ outDir: OUT });
  copyFileSync('projects/ngx-mud-ui/package.json', join(OUT, 'package.json'));
  runner = new SchematicTestRunner('ngx-mud-ui', join(OUT, 'schematics', 'collection.json'));
}, 60_000);

describe('ng-add', () => {
  it('runs ng-add on a fresh app without throwing', async () => {
    await expect(runner.runSchematic('ng-add', {}, await createApp())).resolves.toBeInstanceOf(UnitTestTree);
  });

  it('asks for --project in a workspace with several applications', async () => {
    await expect(runner.runSchematic('ng-add', {}, await createApp(['admin', 'portal']))).rejects.toThrow(
      'Several applications found: admin, portal. Rerun with --project <name>.',
    );
  });

  describe('angular.json styles', () => {
    const OVERLAY = '@angular/cdk/overlay-prebuilt.css';
    const MUD = 'ngx-mud-ui/prebuilt/mud.css';
    const DARK = 'ngx-mud-ui/prebuilt/mud-dark.css';

    it('adds the library styles before the app stylesheet and leaves the vitest target alone', async () => {
      const tree = await runner.runSchematic('ng-add', {}, await createApp());
      const { build, test } = angularJson(tree).projects.app.architect;

      expect(build.options.styles).toEqual([OVERLAY, MUD, 'projects/app/src/styles.scss']);
      expect(test.builder).toBe('@angular/build:unit-test');
      expect(test.options?.styles).toBeUndefined();
    });

    it('creates the styles array when the build target has none', async () => {
      const app = await createApp();

      editAngularJson(app, (json) => delete json.projects.app.architect.build.options.styles);
      const tree = await runner.runSchematic('ng-add', {}, app);

      expect(angularJson(tree).projects.app.architect.build.options.styles).toEqual([OVERLAY, MUD]);
    });

    it('adds the styles to a karma test target too', async () => {
      const app = await createApp();

      editAngularJson(app, (json) => {
        json.projects.app.architect.test = { builder: '@angular/build:karma', options: { styles: ['projects/app/src/styles.scss'] } };
      });
      const tree = await runner.runSchematic('ng-add', {}, app);

      expect(angularJson(tree).projects.app.architect.test.options.styles).toEqual([OVERLAY, MUD, 'projects/app/src/styles.scss']);
    });

    it('adds the dark sheet with --darkMode and is idempotent', async () => {
      const once = await runner.runSchematic('ng-add', { darkMode: true }, await createApp());

      expect(angularJson(once).projects.app.architect.build.options.styles).toEqual([OVERLAY, MUD, DARK, 'projects/app/src/styles.scss']);

      const before = once.readContent('/angular.json');
      const twice = await runner.runSchematic('ng-add', { darkMode: true }, once);

      expect(twice.readContent('/angular.json')).toBe(before);
    });
  });

  describe('body font', () => {
    const STYLES = 'projects/app/src/styles.scss';
    const RULE = 'body {\n  font-family: var(--mud-font-family-base);\n  font-size: 1rem;\n}\n';

    it('appends the body rule to the app stylesheet once', async () => {
      const once = await runner.runSchematic('ng-add', {}, await createApp());

      expect(once.readContent(STYLES).endsWith(RULE)).toBe(true);

      const twice = await runner.runSchematic('ng-add', {}, once);

      expect(twice.readContent(STYLES)).toBe(once.readContent(STYLES));
    });

    it('skips the rule when the app has no global stylesheet', async () => {
      const app = await createApp();

      editAngularJson(app, (json) => {
        json.projects.app.architect.build.options.styles = [];
      });
      const before = app.readContent(STYLES);
      const tree = await runner.runSchematic('ng-add', {}, app);

      expect(tree.readContent(STYLES)).toBe(before);
    });
  });

  describe('peer dependencies', () => {
    const CDK_RANGE = JSON.parse(readFileSync('projects/ngx-mud-ui/package.json', 'utf8')).peerDependencies['@angular/cdk'];

    it('adds a missing @angular/cdk at the library peer range and schedules an install', async () => {
      const tree = await runner.runSchematic('ng-add', {}, await createApp());

      expect(JSON.parse(tree.readContent('/package.json')).dependencies['@angular/cdk']).toBe(CDK_RANGE);
      expect(runner.tasks.some((task) => task.name === 'node-package')).toBe(true);
    });

    it('leaves an installed @angular/cdk version alone', async () => {
      const app = await createApp();
      const pkg = JSON.parse(app.readContent('/package.json'));

      pkg.dependencies['@angular/cdk'] = '22.2.2';
      app.overwrite('/package.json', JSON.stringify(pkg, null, 2));
      const tree = await runner.runSchematic('ng-add', {}, app);

      expect(JSON.parse(tree.readContent('/package.json')).dependencies['@angular/cdk']).toBe('22.2.2');
    });
  });

  describe('summary', () => {
    async function logsOf(options: Record<string, unknown>): Promise<string[]> {
      const app = await createApp();
      const logs: string[] = [];
      const sub = runner.logger.subscribe((entry) => logs.push(entry.message));

      await runner.runSchematic('ng-add', options, app);
      sub.unsubscribe();

      return logs;
    }

    it('logs what each step did under one heading', async () => {
      const logs = await logsOf({});

      expect(logs[0]).toBe('ngx-mud-ui setup:');
      const cdkRange = JSON.parse(readFileSync('projects/ngx-mud-ui/package.json', 'utf8')).peerDependencies['@angular/cdk'];

      expect(logs).toContain(`  added @angular/cdk@${cdkRange}`);
      expect(logs).toContain('  build: added @angular/cdk/overlay-prebuilt.css, ngx-mud-ui/prebuilt/mud.css');
      expect(logs).toContain('  test: covered by build');
      expect(logs).toContain('  added body font to projects/app/src/styles.scss');
      expect(logs.some((line) => line.includes('data-theme'))).toBe(false);
    });

    it('reminds to set data-theme when dark mode is added', async () => {
      expect(await logsOf({ darkMode: true })).toContain('Dark mode styles added — set data-theme="dark" on <html> to switch it on.');
    });
  });

  it('ships a CommonJS scope', () => {
    expect(JSON.parse(readFileSync(join(OUT, 'schematics', 'package.json'), 'utf8'))).toEqual({ type: 'commonjs' });
  });
});
