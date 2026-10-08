import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const url = 'https://fix-mobile-contact-cta-visib.codefix-it---portfolio-short.pages.dev/';
const engine = process.argv.includes('--webkit') ? 'webkit' : 'chromium';
const browser = await (engine === 'webkit' ? webkit : chromium).launch({ headless: true });
const sizes = [
  { label: '360', width: 360, height: 780 },
  { label: '390', width: 390, height: 844 },
  { label: '430', width: 430, height: 932 },
  { label: '720', width: 720, height: 960 },
  { label: '768', width: 768, height: 920 },
  { label: '1440', width: 1440, height: 900 },
];
await mkdir('artifacts/qa87',{recursive:true});
const results = [];
for(const size of sizes) {
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},reducedMotion:'no-preference'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('.cf-hero-path').first().waitFor({state:'visible',timeout:40000});
  const sticky=page.locator('.cf-mobile-sticky-cta');
  const mobile=size.width<=720;
  const inspect=()=>sticky.evaluate(el=>({display:globalThis.getComputedStyle(el).display,visibility:globalThis.getComputedStyle(el).visibility,opacity:globalThis.getComputedStyle(el).opacity}));
  const before=await inspect();
  assert.equal(before.display!=='none',mobile,engine+' '+size.label+' sticky initial display');
  const overflow=await page.evaluate(()=>Math.max(0,globalThis.document.documentElement.scrollWidth-globalThis.document.documentElement.clientWidth));
  assert.equal(overflow,0,engine+' '+size.label+' has horizontal overflow');
  if(mobile) {
    await page.evaluate(()=>globalThis.document.querySelector('#contact').scrollIntoView({block:'start',behavior:'instant'}));
    await page.waitForFunction(()=>globalThis.document.querySelector('.homepage-v1').classList.contains('cf-contact-in-view'),{timeout:12000});
    let state=await inspect();
    assert.equal(state.visibility,'hidden',engine+' '+size.label+' contact sticky hidden');
    await page.evaluate(()=>globalThis.document.querySelector('.cf-footer').scrollIntoView({block:'start',behavior:'instant'}));
    await page.waitForFunction(()=>globalThis.document.querySelector('.homepage-v1').classList.contains('cf-contact-in-view'),{timeout:12000});
    state=await inspect();
    assert.equal(state.visibility,'hidden',engine+' '+size.label+' footer sticky hidden');
    await page.evaluate(()=>globalThis.window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForFunction(()=>!globalThis.document.querySelector('.homepage-v1').classList.contains('cf-contact-in-view'),{timeout:12000});
    state=await inspect();
    assert.equal(state.visibility,'visible',engine+' '+size.label+' back to top sticky returns');
    await sticky.click();
    assert.equal(new URL(page.url()).hash,'#contact',engine+' '+size.label+' sticky CTA hash');
    await page.evaluate(()=>globalThis.window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForFunction(()=>globalThis.getComputedStyle(globalThis.document.querySelector('.cf-mobile-sticky-cta')).visibility==='visible',{timeout:12000});
    assert.equal((await inspect()).visibility,'visible',engine+' '+size.label+' sticky returns while URL hash persists');
  }
  const screenshot='artifacts/qa87/'+engine+'-'+size.label+'.png';
  await page.screenshot({path:screenshot,fullPage:false,animations:'disabled'});
  assert.deepEqual(errors,[],engine+' '+size.label+' page errors');
  results.push({engine,width:size.width,mobile,overflow,passed:true});
  console.log('PASS '+engine+' '+size.label+' scroll contact/footer/back hash & no overflow');
  await context.close();
}
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.cf-mobile-sticky-cta').waitFor({state:'visible'});
const transition=await page.locator('.cf-mobile-sticky-cta').evaluate(el=>globalThis.getComputedStyle(el).transitionDuration);
assert.ok(transition.split(',').every(x=>parseFloat(x)===0),'Reduced motion should disable transition: '+transition);
await context.close();
await browser.close();
await writeFile('artifacts/qa87/'+engine+'.json',JSON.stringify(results,null,2));
console.log('SUMMARY '+engine+' 6 sizes PASS + prefers-reduced-motion PASS');
