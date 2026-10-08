import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const homepage = await readFile(new URL('../src/pages/HomepageV1.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/pages/HomepageV1.v3.css', import.meta.url), 'utf8');

assert.match(homepage, /const contactSectionRef = useRef<HTMLElement \| null>\(null\)/);
assert.match(homepage, /const footerRef = useRef<HTMLElement \| null>\(null\)/);
assert.match(homepage, /new IntersectionObserver\(/);
assert.match(homepage, /const visibleTargets = new Set<Element>\(\)/);
assert.match(homepage, /if \(entry\.isIntersecting\) visibleTargets\.add\(entry\.target\)/);
assert.match(homepage, /else visibleTargets\.delete\(entry\.target\)/);
assert.match(homepage, /setContactAreaVisible\(visibleTargets\.size > 0\)/);
assert.match(homepage, /rootMargin: '0px 0px 72px 0px'/);
assert.match(homepage, /observer\.disconnect\(\)/);
assert.match(homepage, /cf-contact-in-view/);
assert.match(homepage, /<footer className="cf-footer" ref=\{footerRef\}>/);
assert.match(homepage, /className="cf-mobile-sticky-cta"/);
assert.match(homepage, /href="#contact"/);

assert.match(styles, /@media \(max-width: 720px\)/);
assert.match(styles, /\.homepage-v1\.cf-contact-in-view \.cf-mobile-sticky-cta\s*\{[^}]*visibility:\s*hidden;[^}]*pointer-events:\s*none;/s);
assert.doesNotMatch(
  styles,
  /\.homepage-v1:has\(#contact:target\)\s+\.cf-mobile-sticky-cta/,
  'A permanent :target selector would keep CTA hidden after scrolling back.',
);
assert.match(styles, /:has\(\.cf-lead-form:focus-within\) \.cf-mobile-sticky-cta/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.cf-mobile-sticky-cta\s*\{[^}]*transition:\s*none;/);
process.stdout.write('Mobile contact CTA source regression smoke: OK\n');
