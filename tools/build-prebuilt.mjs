// Compiles the library's base CSS into dist: prebuilt/mud.css, the opt-in prebuilt/mud-dark.css,
// fonts/Onest/* (relative url()s), and the LICENSE + THIRD_PARTY_NOTICES.md that ng-packagr can't reach.
import { compile } from 'sass';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const STYLES = 'projects/ngx-mud-ui/src/lib/styles';
const LEGAL_FILES = ['LICENSE', 'THIRD_PARTY_NOTICES.md'];

export async function buildPrebuilt({ outDir = 'dist/ngx-mud-ui' } = {}) {
  const options = { style: 'expanded', silenceDeprecations: ['if-function'] };
  const { css } = compile(join(STYLES, 'prebuilt', 'mud.scss'), options);
  const { css: darkCss } = compile(join(STYLES, 'prebuilt', 'mud-dark.scss'), options);

  mkdirSync(join(outDir, 'prebuilt'), { recursive: true });
  writeFileSync(join(outDir, 'prebuilt', 'mud.css'), css);
  writeFileSync(join(outDir, 'prebuilt', 'mud-dark.css'), darkCss);
  cpSync(join(STYLES, 'fonts', 'Onest'), join(outDir, 'fonts', 'Onest'), { recursive: true });
  for (const f of LEGAL_FILES) cpSync(f, join(outDir, f));

  // Fail the build loudly rather than publish a package without its base stylesheet, fonts or licences.
  for (const f of ['prebuilt/mud.css', 'prebuilt/mud-dark.css', 'fonts/Onest/OFL.txt', ...LEGAL_FILES]) if (!existsSync(join(outDir, f))) throw new Error(`build-prebuilt: ${f} was not written`);
  return { css, darkCss };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildPrebuilt({ outDir: process.argv[2] });
  console.log('prebuilt/mud.css + prebuilt/mud-dark.css written');
}
