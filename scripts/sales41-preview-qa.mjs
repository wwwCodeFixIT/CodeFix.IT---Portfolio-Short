import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
const baseline='https://codefix.it/naprawa-wordpress/';
const preview='https://feat-sales-4-1-quickfix-hero.codefix-it---portfolio-short.pages.dev/naprawa-wordpress/';
const engine=process.argv.includes('--webkit')?webkit:chromium;
const browser=await engine.launch({headless:true});
const originalText='Formularz nie wysyła? Aktualizacja zepsuła stronę?';
const newText='Błąd krytyczny WordPress? Nie działa formularz, WooCommerce lub strona po aktualizacji?';
const summary=[];
await mkdir('artifacts/sales41',{recursive:true});
for(const size of [{w:390,h:844},{w:1440,h:900}]){
  for(const [kind,url] of [['baseline',baseline],['preview',preview]]){
    const ctx=await browser.newContext({viewport:{width:size.w,height:size.h}});
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // No analytics, CRM events or test leads may be sent to production from this smoke check.
    await page.route('https://app.codefix.it/**',route=>route.abort());
    await page.route('**/googletagmanager.com/**',route=>route.abort());
    await page.route('**/google-analytics.com/**',route=>route.abort());
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('.service-hero-lead').waitFor({state:'visible',timeout:45000});
    const content=await page.locator('.service-hero-lead').innerText();
    assert.ok(content.startsWith(kind==='preview'?newText:originalText),kind+' hero content failed at '+size.w+': '+content.slice(0,125));
    assert.ok(content.includes('bez podawania loginu') || kind==='baseline',kind+' must retain no-password guidance');
    assert.equal((await page.locator('.service-offer-card > strong').innerText()).trim(),'Od 390 zł','price unexpectedly changed');
    const metadata=await page.evaluate(()=>({
      path:globalThis.location.pathname,
      canonical:globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      overflow:Math.max(0,globalThis.document.documentElement.scrollWidth-globalThis.document.documentElement.clientWidth)
    }));
    assert.equal(metadata.canonical,'https://codefix.it/naprawa-wordpress/');
    assert.equal(metadata.overflow,0,'horizontal scroll on '+kind+' '+size.w);
    const panel=page.locator('.cf-measurement-panel');
    if(await panel.count()) {await page.getByRole('button',{name:'Odrzuć wszystkie'}).click();await panel.waitFor({state:'detached',timeout:10000});}
    await page.locator('.service-hero-copy .cf-button-primary').click();
    assert.equal(new URL(page.url()).hash,'#kontakt','CTA did not jump to contact form');
    assert.equal(await page.locator('.cf-lead-form input[name="pageUrl"]').getAttribute('required'),'','website URL remains required');
    assert.deepEqual(errors,[],'JS page errors: '+errors.join(' ; '));
    await page.screenshot({path:'artifacts/sales41/'+engine.name()+'-'+kind+'-'+size.w+'.png',animations:'disabled'});
    console.log('PASS '+engine.name()+' '+kind+' '+size.w+' hero content, price, CTA, canonical, overflow, no errors');
    summary.push({kind,width:size.w,engine:engine.name(),hero:content.slice(0,100),passed:true});
    await ctx.close();
  }
}
await browser.close();
await writeFile('artifacts/sales41/results-'+engine.name()+'.json',JSON.stringify(summary,null,2));
console.log('SUMMARY '+engine.name()+' 4/4 browser comparisons passed');
