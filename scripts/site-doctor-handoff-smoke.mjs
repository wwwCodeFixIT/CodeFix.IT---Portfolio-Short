import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/site-doctor-handoff.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(js.diagnostics?.length ?? 0, 0);
const api = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(js.outputText));

const evidence = {
  url: 'https://example.org/path?private=token',
  finalUrl: 'https://example.org/path?private=token',
  testedAt: '2026-10-16T12:30:00Z',
  scores: { performance: 65, seo: 91, accessibility: 88 },
  checks: [
    { id: 'description', label: 'Meta description', status: 'fail' },
    { id: 'lcp', label: 'LCP', status: 'warning' },
    { id: 'lang', label: 'Język HTML', status: 'pass' },
  ],
  note: 'PRIVATE INFORMATION',
  aiExplanation: 'NEVER STORE COMMENTARY',
  description: 'A personal message that must be excluded',
};
const summary = api.buildDoctorHandoff(evidence);
assert.ok(summary.startsWith('ZAŁĄCZONY RAPORT AI SITE DOCTOR'));
assert.ok(summary.includes('Wydajność: 65/100'));
assert.ok(summary.includes('Meta description: problem'));
assert.ok(!summary.includes('PRIVATE INFORMATION'));
assert.ok(!summary.includes('NEVER STORE COMMENTARY'));
assert.ok(!summary.includes('personal message'));
assert.ok(!summary.includes('private=token'));
assert.equal(api.doctorPageUrl(summary), 'https://example.org/path');
assert.equal(api.buildDoctorHandoff({ ...evidence, finalUrl: 'http://localhost', url: 'http://localhost' }), '');
assert.equal(api.doctorPageUrl('not-a-report\nStrona: https://evil.test'), '');
assert.ok(summary.length <= api.DOCTOR_HANDOFF_LIMIT);

const values = new Map();
const storage = {
  setItem(key, value) { values.set(key, value); },
  getItem(key) { return values.get(key) ?? null; },
  removeItem(key) { values.delete(key); },
};
const now = 2000000;
assert.ok(api.writeDoctorHandoff(storage, summary, now));
assert.equal(api.readDoctorHandoff(storage, now + api.DOCTOR_HANDOFF_TTL - 1)?.summary, summary);
assert.equal(api.readDoctorHandoff(storage, now + api.DOCTOR_HANDOFF_TTL + 1), null);
assert.equal(values.size, 0, 'Expired report is removed');
assert.equal(api.writeDoctorHandoff(storage, 'A random string', now), false);
assert.equal(api.writeDoctorHandoff(storage, 'ZAŁĄCZONY RAPORT AI SITE DOCTOR'.repeat(100), now), false);
assert.equal(api.readDoctorHandoff(storage, now), null);
assert.ok(api.writeDoctorHandoff(storage, summary, now));
assert.equal(api.readDoctorHandoff(storage, now - 1), null, 'Reject future timestamps');
assert.ok(api.writeDoctorHandoff(storage, summary, now));
api.deleteDoctorHandoff(storage);
assert.equal(values.size, 0);

const blocked = {
  getItem() { throw Error('storage disabled'); },
  setItem() { throw Error('storage disabled'); },
  removeItem() { throw Error('storage disabled'); },
};
assert.equal(api.readDoctorHandoff(blocked), null);
assert.equal(api.writeDoctorHandoff(blocked, summary), false);
api.deleteDoctorHandoff(blocked);

const form = await readFile(new URL('../src/pages/HomepageV1.tsx', import.meta.url), 'utf8');
assert.ok(form.includes('[description.trim(), supplementText, doctorText]'));
assert.ok(form.includes('checked={doctorIncluded}'));
assert.ok(form.includes('Dołącz ten raport do treści zgłoszenia'));
assert.ok(form.includes('onClick={removeDoctorReport}'));
assert.ok(form.includes('deleteDoctorHandoff(window.sessionStorage)'));
assert.ok(form.includes('defaultValue={defaultDoctorPageUrl}'));
assert.ok(form.includes('message,\n          companyWebsite:'), 'Existing CRM message payload is unchanged');
const doctor = await readFile(new URL('../src/components/SiteDoctor.tsx', import.meta.url), 'utf8');
assert.ok(doctor.includes('writeDoctorHandoff(window.sessionStorage, summary)'));
assert.ok(doctor.includes('window.location.assign('));
assert.ok(doctor.includes('Dołącz diagnozę do zapytania'));
console.log('Site Doctor lead handoff PASS: redaction, TTL, user opt-in, removal and existing CRM payload.');
