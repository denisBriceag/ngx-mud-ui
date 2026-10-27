// The library's font-leak guard (`pnpm stories:fonts`, run after `pnpm build-storybook`):
// Storybook's page sets Onest like a real app would, which hides a component that forgot to set
// its own font. This renders every story with the page font swapped for a sentinel that does not
// exist, and fails on any visible text inside a library component that is not Onest — that text
// inherited the page font. Story-only demo components are not library and are not checked.
import { createServer } from 'node:http';
import { globSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const SENTINEL = 'MudFontLeakSentinel';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

/** Every `selector:` the library declares, as one `closest()` selector; story components excluded. */
export function librarySelector(root) {
  const selectors = new Set();

  for (const file of globSync(`${root}/*/src/lib/**/*.ts`).filter((f) => !f.includes('/specs/'))) {
    for (const [, list] of readFileSync(file, 'utf8').matchAll(/selector:\s*'([^']+)'/g)) {
      // A bare `[attr]` selector is a behaviour directive on the consumer's own element (mudTooltip,
      // mudMenuTriggerFor…) and styles nothing; `button[mudButton]`-style hosts do.
      for (const s of list.split(',').map((x) => x.trim())) if (!s.startsWith('[') && !s.includes('ng-template')) selectors.add(s);
    }
  }
  // Library-rendered elements outside a component host: overlay content (menus, dialogs, toasts)
  // in the CDK container, and the corner badge mudBadge appends to the consumer's element.
  selectors.add('.cdk-overlay-container');
  selectors.add('.badge--fixed');

  return [...selectors].join(', ');
}

function serve(dir) {
  const server = createServer((req, res) => {
    const path = normalize(join(dir, decodeURIComponent(req.url.split('?')[0]))).replace(/\/$/, '/index.html');

    let body;

    try {
      body = readFileSync(path);
    } catch {
      res.writeHead(404).end();

      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(body);
  });

  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

export async function checkStoryFonts({ staticDir, libRoot, concurrency = 6 }) {
  const selector = librarySelector(libRoot);
  const index = JSON.parse(readFileSync(join(staticDir, 'index.json'), 'utf8'));
  const ids = Object.entries(index.entries).filter(([, e]) => e.type === 'story').map(([id]) => id);
  const server = await serve(staticDir);
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const leaks = [];
  const queue = [...ids];

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

      while (queue.length) {
        const id = queue.shift();

        await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`);
        await page.addStyleTag({ content: `body { font-family: '${SENTINEL}', monospace !important; }` });
        await page.waitForTimeout(800);
        const found = await page.evaluate((sel) => {
          const out = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

          while (walker.nextNode()) {
            const el = walker.currentNode.parentElement;

            if (!walker.currentNode.textContent.trim() || !el?.checkVisibility() || !el.closest(sel)) continue;
            const family = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();

            if (family.toLowerCase() !== 'onest') out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> "${walker.currentNode.textContent.trim().slice(0, 30)}" → ${family}`);
          }

          return [...new Set(out)];
        }, selector);

        for (const leak of found) leaks.push(`${id}: ${leak}`);
      }
      await page.close();
    }),
  );
  await browser.close();
  server.close();

  return { stories: ids.length, leaks };
}

// CLI: node tools/check-story-fonts.mjs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { stories, leaks } = await checkStoryFonts({ staticDir: 'storybook-static', libRoot: 'projects/ngx-mud-ui' });

  for (const leak of leaks) console.error(leak);
  console.log(`stories:fonts — ${stories} stories, ${leaks.length} leak(s)`);
  process.exitCode = leaks.length ? 1 : 0;
}
