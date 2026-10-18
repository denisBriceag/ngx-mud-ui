// Compiles the library's base CSS into dist: prebuilt/mud.css, the opt-in prebuilt/mud-dark.css,
// and fonts/Onest/* (relative url()s).
import { compile } from 'sass';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const STYLES = 'projects/ngx-mud-ui/src/lib/styles';

export async function buildPrebuilt({ outDir = 'dist/ngx-mud-ui' } = {}) {
  const options = { style: 'expanded', silenceDeprecations: ['if-function'] };
  const { css } = compile(join(STYLES, 'prebuilt', 'mud.scss'), options);
  const { css: darkCss } = compile(join(STYLES, 'prebuilt', 'mud-dark.scss'), options);

  mkdirSync(join(outDir, 'prebuilt'), { recursive: true });
  writeFileSync(join(outDir, 'prebuilt', 'mud.css'), css);
  writeFileSync(join(outDir, 'prebuilt', 'mud-dark.css'), darkCss);
  cpSync(join(STYLES, 'fonts', 'Onest'), join(outDir, 'fonts', 'Onest'), { recursive: true });

  // Fail the build loudly rather than publish a package without its base stylesheet or fonts.
  for (const f of ['prebuilt/mud.css', 'prebuilt/mud-dark.css', 'fonts/Onest']) if (!existsSync(join(outDir, f))) throw new Error(`build-prebuilt: ${f} was not written`);
  return { css, darkCss };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildPrebuilt({ outDir: process.argv[2] });
  console.log('prebuilt/mud.css + prebuilt/mud-dark.css written');
}
