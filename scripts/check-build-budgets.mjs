import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const assetsDir = new URL('../dist/assets/', import.meta.url);
const indexHtml = await readFile(new URL('index.html', distDir), 'utf8');

const entryMatch = indexHtml.match(/<script[^>]+type=["']module["'][^>]+src=["']\/assets\/([^"']+\.js)["']/i)
  ?? indexHtml.match(/<script[^>]+src=["']\/assets\/([^"']+\.js)["'][^>]+type=["']module["']/i);

if (!entryMatch) {
  throw new Error('Cannot determine production entry JavaScript from dist/index.html');
}

const entryFile = entryMatch[1];
const assetNames = await readdir(assetsDir);
const jsNames = assetNames.filter((name) => name.endsWith('.js'));
const cssNames = assetNames.filter((name) => name.endsWith('.css'));

async function sizeOf(name) {
  return (await stat(join(assetsDir.pathname, name))).size;
}

const js = await Promise.all(jsNames.map(async (name) => ({ name, bytes: await sizeOf(name) })));
const css = await Promise.all(cssNames.map(async (name) => ({ name, bytes: await sizeOf(name) })));

const entry = js.find((asset) => asset.name === entryFile);
if (!entry) {
  throw new Error(`Entry JavaScript ${entryFile} was not found in dist/assets`);
}

const deferred = js.filter((asset) => asset.name !== entryFile);
const largestDeferred = deferred.reduce(
  (largest, asset) => (asset.bytes > largest.bytes ? asset : largest),
  { name: 'none', bytes: 0 },
);
const largestCss = css.reduce(
  (largest, asset) => (asset.bytes > largest.bytes ? asset : largest),
  { name: 'none', bytes: 0 },
);

const totalJs = js.reduce((sum, asset) => sum + asset.bytes, 0);
const totalCss = css.reduce((sum, asset) => sum + asset.bytes, 0);

const budgets = {
  entryJs: 215_000,
  // Free-project selection adds ~1.2 KB to the homepage route.
  // Native process disclosures and their short copy add ~0.8 KB to the homepage.
  // Native mobile navigation and shared links add ~1.3 KB to the homepage route.
  // LAB-3 adds the optional doctor-to-CRM handoff and consent state to the deferred homepage (about 2.5 KB).
  // Keeping the form mounted adds ~1.8 KB for the native dialog and its trigger.
  // The scanner and shared tool controls still load only when requested.
  // Homepage lab launcher adds ~1.6 KB; the shared tool workspace still loads on explicit open.
  largestDeferredJs: 59_000,
  // Native project quick view: shared triggers + dialog loaded only on demand (~5 KB).
  // Shared inline field feedback adds ~0.6 KB net; entry and route caps stay unchanged.
  // Local guide search adds ~1.5 KB on guide routes, with no new dependencies.
  // Native contents navigation and section tracking add ~2.1 KB on guide routes.
  // Guide field hints, the free-project request and contact focus add ~3.0 KB in total.
  // Project annotations add ~2.6 KB, loaded with the optional quick-view dialog.
  // Process details use native HTML and add ~0.8 KB without a new controller.
  // Project link copying adds ~0.9 KB inside the deferred dialog, without dependencies.
  // Mobile menu: native popover, focus handling and no added dependencies (~1.3 KB).
  // Standalone tools lab route with local validators and optional AI interface.
  // Site Doctor loads on demand: +9.9 KB across lazy chunks; entry cap unchanged.
  // Includes the independent, opt-in diagnostic attachment and transfer helper.
  // Automation map: +9.6 KB overall, with the 9.0 KB planner loaded on demand.
  // Entry and homepage route sizes remain unchanged.
  // Embedded lab and in-page contact callbacks add ~2.1 KB overall, without dependencies.
  totalJs: 382_000,
  // Branded optional report controls add ~0.7 KB to the deferred contact stylesheet.
  largestCss: 41_000,
  // Includes the isolated quick-view stylesheet and reference attachment (~3.7 KB).
  // Guide search controls and empty state add ~0.9 KB on guide routes.
  // The isolated contents bar adds ~1.0 KB on guide routes.
  // Form hints, the offer row and its checkbox add ~0.8 KB.
  // Numbered annotations and their disclosure add ~1.1 KB to the deferred dialog CSS.
  // Copy feedback and its manual fallback add ~0.5 KB to the deferred dialog CSS.
  // Mobile panel, desktop target sizes and static navigation add ~1.3 KB.
  // Isolated tools-lab style only loads on /narzedzia/.
  // Branded Site Doctor stylesheet loads on demand; largest CSS cap unchanged.
  // Isolated automation map styles add 3.7 KB only when the planner is opened.
  totalCss: 102_000,
};

console.log(`Entry JS: ${entry.bytes} B / ${budgets.entryJs} B — ${entry.name}`);
console.log(
  `Largest deferred JS: ${largestDeferred.bytes} B / ${budgets.largestDeferredJs} B — ${largestDeferred.name}`,
);
console.log(`Total JS: ${totalJs} B / ${budgets.totalJs} B`);
console.log(`Largest CSS: ${largestCss.bytes} B / ${budgets.largestCss} B — ${largestCss.name}`);
console.log(`Total CSS: ${totalCss} B / ${budgets.totalCss} B`);

const failures = [];
if (entry.bytes > budgets.entryJs) failures.push('entry JavaScript');
if (largestDeferred.bytes > budgets.largestDeferredJs) failures.push('deferred JavaScript chunk');
if (totalJs > budgets.totalJs) failures.push('total JavaScript');
if (largestCss.bytes > budgets.largestCss) failures.push('CSS chunk');
if (totalCss > budgets.totalCss) failures.push('total CSS');

if (failures.length > 0) {
  throw new Error(`Build budget exceeded: ${failures.join(', ')}`);
}
