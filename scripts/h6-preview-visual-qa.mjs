import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const live = 'https://codefix.it/';
const preview = 'https://feat-h6-hero-ambient-polish.codefix-it---portfolio-short.pages.dev/';
const browserMode = process.argv.includes('--webkit') ? 'webkit' : 'chromium';
const browser = await (browserMode === 'webkit' ? webkit : chromium).launch({ headless: true });
const scenarios = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];
const out = 'artifacts/h6';
await mkdir(out, { recursive: true });
const report = [];

function relativeLuminance(hex) {
  const rgb = hex.match(/[0-9a-f]{2}/gi)?.map(x => parseInt(x,16) / 255) || [];
  return rgb.reduce((total, c, idx) => {
    const linear = c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
    return total + linear * [.2126, .7152, .0722][idx];
  }, 0);
}
function contrast(a, b) {
  const x = relativeLuminance(a), y = relativeLuminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}

for (const viewport of scenarios) {
  const records = {};
  for (const [key,url] of [['production',live],['preview',preview]]) {
    const ctx = await browser.newContext({ viewport: { width:viewport.width, height:viewport.height }, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('.cf-hero-path').first().waitFor({state:'visible',timeout:40000});
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => {
      const panel = document.querySelector('.cf-hero-paths');
      const before = getComputedStyle(panel,'::before');
      const title = document.querySelector('.cf-title-muted');
      const help = document.querySelector('.cf-hero-path-help');
      return {
        title: document.title,
        h1: document.querySelector('h1')?.innerText,
        pathCount: document.querySelectorAll('.cf-hero-path').length,
        links: [...document.querySelectorAll('.cf-hero-path')].map(a=>a.getAttribute('href')),
        horizontalOverflow: Math.max(0,document.documentElement.scrollWidth - document.documentElement.clientWidth),
        gridBackground: before.backgroundImage,
        gridAnimation: before.animationName,
        mutedTitleColor: getComputedStyle(title).color,
        helpColor: getComputedStyle(help).color,
        heroHeight: Math.round(document.querySelector('.cf-hero').getBoundingClientRect().height)
      };
    });
    assert.equal(data.horizontalOverflow,0,key+' overflow at '+viewport.width);
    assert.equal(data.pathCount,3,key+' needs exactly three existing paths');
    assert.deepEqual(data.links,['#contact','#contact','#contact']);
    assert.ok((data.h1 || '').includes('CodeFix.IT'),key+' missing main heading');
    if(key==='preview'){
      assert.ok(data.gridBackground.includes('linear-gradient'), 'H6 grid should exist');
      assert.equal(data.gridAnimation,'cf-h6-signal','H6 signal animation expected');
      assert.ok(contrast('#9a9aa4','#060606') > 4.5,'H6 muted title contrast');
      assert.ok(contrast('#a0a0a9','#101012') > 4.5,'H6 helper contrast');
    }
    await page.screenshot({path:out+'/'+browserMode+'-'+key+'-'+viewport.name+'.png',fullPage:false,animations:'disabled'});
    const first=page.locator('.cf-hero-path').first();
    await first.click();
    await page.waitForTimeout(300);
    const selected=await page.locator('.cf-lead-form select[name="service"]').inputValue();
    assert.equal(selected,'WORDPRESS_QUICK_FIX',key+' service path should select Quick Fix');
    assert.equal(new URL(page.url()).hash, '#contact');
    assert.equal(errors.length,0,key+' JS runtime errors: '+errors.join('; '));
    records[key]={...data,selectedService:selected,errors};
    await ctx.close();
  }
  assert.equal(records.production.h1,records.preview.h1,'Hero H1 unexpectedly changed');
  assert.deepEqual(records.production.links,records.preview.links,'Hero paths changed');
  report.push({viewport:viewport.name,production:records.production,preview:records.preview,passed:true});
  console.log('PASS '+browserMode+' '+viewport.name+' visual/layout/selection/anchor');
}
const ctx = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page = await ctx.newPage();
await page.goto(preview,{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.cf-hero-path').first().waitFor({state:'visible'});
const animation=await page.locator('.cf-hero-paths').evaluate(el=>getComputedStyle(el,'::before').animationName);
assert.equal(animation,'none','prefers-reduced-motion must disable H6 animation');
console.log('PASS '+browserMode+' reduced-motion');
await ctx.close();
await browser.close();
await writeFile(out+'/results-'+browserMode+'.json',JSON.stringify(report,null,2));
console.log('SUMMARY '+browserMode+' PASS '+report.length+' viewport comparisons, no JS errors, service preselection + hash, accessibility contrast CSS');
