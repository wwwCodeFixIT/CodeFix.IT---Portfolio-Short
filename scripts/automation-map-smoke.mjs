import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/automation-map.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
})
assert.equal(compiled.diagnostics?.length ?? 0, 0)
const api = await import(
  'data:text/javascript;charset=utf-8,' + encodeURIComponent(compiled.outputText)
)

const initial = api.initialAutomationConfig()
assert.equal(initial.useAi, false, 'Planning must start without an AI requirement')
assert.equal(initial.review, true, 'Manual acceptance should be visible by default')
const before = structuredClone(initial)
let configurations = 0
for (const [process, definition] of Object.entries(api.automationProcesses)) {
  const selected = api.selectAutomationProcess(initial, process)
  assert.ok(definition.sources.includes(selected.source))
  assert.ok(definition.destinations.includes(selected.destination))
  for (const source of definition.sources) {
    for (const destination of definition.destinations) {
      for (const useAi of [false, true]) {
        for (const review of [false, true]) {
          const config = {
            ...selected,
            source,
            destination,
            useAi,
            review,
            note: '  Własny cel klienta  ',
          }
          const steps = api.automationSteps(config)
          const scope = api.automationScope(config)
          assert.equal(steps.length, review ? 5 : 4)
          assert.equal(
            steps.some((step) => step.id === 'review'),
            review,
          )
          assert.equal(steps[0].title, api.systemNames[source])
          assert.equal(steps.at(-1).title, api.systemNames[destination])
          assert.equal(steps.find((step) => step.id === 'prepare').mode.includes('AI'), useAi)
          assert.ok(scope.includes('Proces: ' + definition.label))
          assert.ok(scope.includes('Źródło: ' + api.systemNames[source]))
          assert.ok(scope.includes('Miejsce wyniku: ' + api.systemNames[destination]))
          assert.ok(scope.includes(definition.exception), 'Every plan needs an exception path')
          assert.ok(scope.includes('Własne wymagania: Własny cel klienta'))
          assert.ok(scope.length < 4000, 'The plan must fit the existing contact-message limit')
          assert.ok(
            scope.includes(review ? 'ręczna przed przekazaniem' : 'bez osobnego etapu akceptacji'),
          )
          configurations++
        }
      }
    }
  }
}
assert.deepEqual(initial, before, 'Changing process must not mutate the previous plan')
const changed = api.selectAutomationProcess(
  { ...initial, source: 'form', destination: 'email' },
  'orders',
)
assert.equal(changed.source, 'store', 'An unsupported source must switch to the process default')
assert.equal(changed.destination, 'email', 'A supported destination should be retained')
assert.ok(!api.automationScope(initial).includes('Własne wymagania:'))
const longNote = api.automationScope({ ...initial, note: 'z'.repeat(1000) })
assert.ok(longNote.includes('Własne wymagania: ' + 'z'.repeat(280)))
assert.ok(!longNote.includes('z'.repeat(281)))
console.log(
  `Automation map smoke PASS: ${configurations} valid plans, system transitions, acceptance, AI, exception handling, copy limits and no mutation.`,
)
