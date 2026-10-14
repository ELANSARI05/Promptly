import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planTask, canAfford } from '../src/lib/planner';
import { agents } from '../src/lib/catalog';
import { initialWorkspace } from '../src/lib/demo';
test('routes support issues to the intended specialists with an exact upfront price', () => {
  const p = planTask(
    'A customer reports a damaged order and duplicate charge. Draft a resolution.',
  );
  assert.deepEqual(
    p.steps.map((s) => s.agentId),
    ['support', 'strategist', 'writer'],
  );
  assert.equal(p.total, 19);
});
test('explicit community specialist selection honors its developer price', () => {
  const p = planTask(
    'Help write a detailed proposal for our new product.',
    [...agents, { ...agents[0], id: 'community', price: 73 }],
    'community',
  );
  assert.equal(p.total, 77);
  assert.deepEqual(
    p.steps.map((s) => s.agentId),
    ['community', 'reviewer'],
  );
});
test('selected reviewer is never charged twice', () => {
  const p = planTask('Check this technical document for quality.', agents, 'reviewer');
  assert.equal(p.total, 4);
  assert.equal(p.steps.length, 1);
});
test('credit affordability rejects invalid totals', () => {
  assert.equal(canAfford(19, 19), true);
  assert.equal(canAfford(18, 19), false);
  assert.equal(canAfford(19, -10), false);
  assert.equal(canAfford(19, 1.5), false);
});
test('sample credit ledger reconciles to displayed balance', () => {
  const w = initialWorkspace();
  assert.equal(
    w.transactions.reduce((s, t) => s + t.amount, 0),
    w.balance,
  );
  assert.ok(w.runs.every((r) => r.mode === 'demo'));
});
