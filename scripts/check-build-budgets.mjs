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
  largestDeferredJs: 50_000,
  totalJs: 330_000,
  largestCss: 140_000,
  totalCss: 205_000,
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
