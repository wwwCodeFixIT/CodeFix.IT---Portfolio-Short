import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
const browserType = process.argv.includes('--webkit') ? webkit : chromium;
const browser = await browserType.launch({headless:true});
const base='https://fix-sales-4-homepage-ads-onl.codefix-it---portfolio-short.pages.dev/';
const cases=[
 {name:'none',analytics:false,ads:false,status:200,duplicate:false,expected:0},
 {name:'analytics-only',analytics:true,ads:false,status:200,duplicate:false,expected:1},
 {name:'ads-only',analytics:false,ads:true,status:200,duplicate:false,expected:1},
 {name:'both',analytics:true,ads:true,status:200,duplicate:false,expected:1},
 {name:'duplicate',analytics:true,ads:true,status:200,duplicate:true,expected:0},
 {name:'api-rejected',analytics:true,ads:true,status:422,duplicate:false,expected:0}
];
for(const scenario of cases){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];let interceptedPosts=0;let blocked=0;
  page.on('pageerror',e=>errors.push(e.message));
  // Never send a synthetic lead, telemetry, or Google Ads conversion to production.
  await page.route('**/googletagmanager.com/**',route=>route.abort());
  await page.route('**/google-analytics.com/**',route=>route.abort());
  await page.route('**/googleadservices.com/**',route=>route.abort());
  await page.route('**/doubleclick.net/**',route=>route.abort());
  await page.route('https://app.codefix.it/**',route=>{blocked++;return route.abort();});
  await page.route('https://app.codefix.it/api/public/leads',async route=>{
    if(route.request().method()==='POST')interceptedPosts++;
    const headers={
      'access-control-allow-origin':'*',
      'access-control-allow-headers':'*',
      'access-control-allow-methods':'POST, OPTIONS',
      'content-type':'application/json'
    };
    if(route.request().method()==='OPTIONS') return route.fulfill({status:204,headers});
    return route.fulfill({status:scenario.status,headers,body:JSON.stringify(
       scenario.status===200?{leadId:'synthetic-mocked-only',duplicate:scenario.duplicate}:{error:'Test API rejection'}
    )});
  });
  await page.goto(base,{waitUntil:'load',timeout:60000});
  const options=page.locator('.cf-measurement-options input[type="checkbox"]');
  await options.first().waitFor({state:'visible',timeout:30000});
  await options.nth(0).setChecked(scenario.analytics);
  await options.nth(1).setChecked(scenario.ads);
  await page.getByRole('button',{name:'Zapisz wybór'}).click();
  await page.locator('.cf-measurement-panel').waitFor({state:'detached',timeout:15000});
  const saved=await page.evaluate(()=>({
    ga:globalThis.codefixAnalyticsAllowed===true,
    ads:globalThis.codefixAdConsentChoice==='accepted'
  }));
  assert.equal(saved.ga,scenario.analytics,scenario.name+' GA consent mismatch');
  assert.equal(saved.ads,scenario.ads,scenario.name+' Ads consent mismatch');
  // Spy blocks any SDK send while verifying exactly which events would fire.
  await page.evaluate(()=>{
    globalThis.__qaGtagEvents=[];
    globalThis.gtag=(...args)=>{globalThis.__qaGtagEvents.push(args);}
  });
  const form=page.locator('.cf-lead-form');
  await form.locator('input[name="name"]').fill('QA mock only');
  await form.locator('input[name="email"]').fill('qa@example.invalid');
  await form.locator('select[name="service"]').selectOption('WORDPRESS_QUICK_FIX');
  await form.locator('textarea[name="message"]').fill('Synthetic local intercepted browser test only, never delivered to CRM.');
  await form.locator('button[type="submit"]').click();
  if(scenario.status===200)await page.locator('.cf-form-feedback.is-success').waitFor({state:'visible',timeout:25000});
  else await page.locator('.cf-form-feedback.is-error').waitFor({state:'visible',timeout:25000});
  const emitted=await page.evaluate(()=>globalThis.__qaGtagEvents.filter(x=>x[0]==='event'&&x[1]==='generate_lead').length);
  assert.equal(interceptedPosts,1,scenario.name+' should call intercepted lead endpoint exactly once');
  assert.equal(emitted,scenario.expected,scenario.name+' lead measurement mismatch');
  assert.deepEqual(errors,[],scenario.name+' JavaScript errors');
  console.log('PASS '+browserType.name()+' '+scenario.name+' consent='+JSON.stringify(saved)+' emitted='+emitted+' intercepted='+interceptedPosts);
  await context.close();
}
await browser.close();
console.log('SUMMARY '+browserType.name()+' 6/6 scenarios passed: no real lead API requests or conversions sent');
