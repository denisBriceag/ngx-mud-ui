// Compiles the ng-add schematic to CommonJS in dist: ng-packagr neither builds schematics nor reads outside the library.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = 'schematics';
const COPIED = ['collection.json', 'ng-add/schema.json'];

export function buildSchematics({ outDir = 'dist/ngx-mud-ui' } = {}) {
  const out = join(outDir, 'schematics');

  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', join(SRC, 'tsconfig.json'), '--outDir', out], { stdio: 'inherit' });

  for (const f of COPIED) {
    mkdirSync(join(out, f, '..'), { recursive: true });
    copyFileSync(join(SRC, f), join(out, f));
  }

  // The dist package.json is "type": "module"; the CLI loads schematics with require().
  writeFileSync(join(out, 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`);

  for (const f of [...COPIED, 'ng-add/index.js', 'package.json']) if (!existsSync(join(out, f))) throw new Error(`build-schematics: ${f} was not written`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildSchematics({ outDir: process.argv[2] });
  console.log('schematics written');
}
