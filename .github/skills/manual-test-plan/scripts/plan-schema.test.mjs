import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';
import { validateAgainstSchema } from './render/plan-schema.mjs';
import { makePlan } from './test-helpers.mjs';

const modelDoc = resolve(dirname(fileURLToPath(import.meta.url)), '../references/test-plan-model.md');

test('accepts the example in test-plan-model.md', () => {
  const doc = readFileSync(modelDoc, 'utf8');
  const example = JSON.parse(doc.match(/```json\n([\s\S]*?)\n```/)[1]);
  assert.doesNotThrow(() => validateAgainstSchema(example));
});

test('accepts the test fixture', () => {
  assert.doesNotThrow(() => validateAgainstSchema(makePlan(true)));
});

test('reports a missing required field with its path', () => {
  const plan = makePlan(false);
  delete plan.forms[0].skjemanummer;
  assert.throws(() => validateAgainstSchema(plan), /forms\[0\]\.skjemanummer is required/);
});

test('uses the schema message for an invalid slug', () => {
  const plan = makePlan(false);
  plan.slug = 'Not A Slug';
  assert.throws(() => validateAgainstSchema(plan), /slug/);
});
