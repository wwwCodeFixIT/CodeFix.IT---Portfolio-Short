import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/hero-motion.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { heroPointerMotion, createHeroPointerController } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)
const bounds = { left: 10, top: 20, width: 100, height: 200 }
const center = heroPointerMotion(60, 120, bounds)
assert.equal(Math.abs(center.rotateX), 0)
assert.equal(center.rotateY, 0)
assert.deepEqual(heroPointerMotion(110, 220, bounds), {
  rotateX: -5,
  rotateY: 7,
  lightX: 18,
  lightY: 12,
})
assert.deepEqual(heroPointerMotion(-9999, -9999, bounds), {
  rotateX: 5,
  rotateY: -7,
  lightX: -18,
  lightY: -12,
})
assert.deepEqual(heroPointerMotion(1, 1, { ...bounds, width: 0 }), {
  rotateX: 0,
  rotateY: 0,
  lightX: 0,
  lightY: 0,
})
assert.deepEqual(heroPointerMotion(NaN, Infinity, bounds), {
  rotateX: 0,
  rotateY: 0,
  lightX: 0,
  lightY: 0,
})

let targetAvailable = true
let layoutReads = 0
const styles = new Map()
const frames = new Map()
let nextFrame = 0
const target = {
  getBoundingClientRect() {
    layoutReads++
    return bounds
  },
  style: {
    setProperty(key, value) {
      styles.set(key, value)
    },
  },
}
const controller = createHeroPointerController(() => (targetAvailable ? target : null), {
  request(callback) {
    const id = nextFrame++
    frames.set(id, callback)
    return id
  },
  cancel(id) {
    frames.delete(id)
  },
})

for (let i = 0; i < 100; i++) controller.move(i, i)
controller.move(110, 220)
assert.equal(frames.size, 1, 'Pointer updates must coalesce into one frame, including frame ID 0.')
assert.equal(layoutReads, 0, 'Pointer events must not synchronously read layout.')
const runFrame = () => {
  const [id, callback] = frames.entries().next().value
  frames.delete(id)
  callback()
}
runFrame()
assert.equal(layoutReads, 1)
assert.equal(styles.get('--cf-rotate-y'), '7.00deg')
assert.equal(styles.get('--cf-light-y'), '12.00px')

controller.move(30, 80)
controller.reset()
assert.equal(frames.size, 0, 'Pausing or leaving the hero must cancel a pending frame.')
assert.equal(styles.get('--cf-rotate-y'), '0.00deg')
assert.equal(styles.get('--cf-light-y'), '0.00px')

const readsBeforeUnmount = layoutReads
targetAvailable = false
controller.move(10, 20)
runFrame()
controller.reset()
assert.equal(layoutReads, readsBeforeUnmount, 'An unmounted hero must not read or update its DOM.')
console.log(
  'PASS: bounded motion, invalid geometry, one update per frame, cancellation and DOM cleanup.',
)
