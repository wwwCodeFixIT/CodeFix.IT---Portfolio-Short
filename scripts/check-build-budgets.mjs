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
  largestDeferredJs: 51_000,
  // Native project quick view: shared triggers + dialog loaded only on demand (~5 KB).
  // Shared inline field feedback adds ~0.6 KB net; entry and route caps stay unchanged.
  // Local guide search adds ~1.5 KB on guide routes, with no new dependencies.
  // Native contents navigation and section tracking add ~2.1 KB on guide routes.
  // Guide field hints, the free-project request and contact focus add ~3.0 KB in total.
  // Project annotations add ~2.6 KB, loaded with the optional quick-view dialog.
  totalJs: 336_000,
  largestCss: 40_000,
  // Includes the isolated quick-view stylesheet and reference attachment (~3.7 KB).
  // Guide search controls and empty state add ~0.9 KB on guide routes.
  // The isolated contents bar adds ~1.0 KB on guide routes.
  // Form hints, the offer row and its checkbox add ~0.8 KB.
  // Numbered annotations and their disclosure add ~1.1 KB to the deferred dialog CSS.
  totalCss: 82_500,
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
