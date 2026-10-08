import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, test } from 'vitest';
import { buildModel, checkFillSequence, extractCustomReferences } from './form-flow-model.mjs';

const field = (key, extra = {}) => ({ type: 'textfield', input: true, key, label: key, ...extra });
const required = (key, extra = {}) => field(key, { validate: { required: true }, ...extra });
const radio = (key, extra = {}) => field(key, { type: 'radiopanel', ...extra });
const panel = (key, components, extra = {}) => ({
  type: 'panel',
  input: false,
  tree: false,
  key,
  title: key,
  components,
  ...extra,
});

const form = {
  title: 'Test form',
  components: [
    panel('start', [
      radio('choice'),
      field('shownForYes', { conditional: { show: true, when: 'choice', eq: 'yes' } }),
      field('other'),
      {
        type: 'navSkjemagruppe',
        input: false,
        tree: false,
        key: 'group',
        label: 'Group',
        conditional: { show: true, when: 'boxes', eq: 'b' },
        components: [field('inGroup')],
      },
      field('boxes', { type: 'selectboxes' }),
    ]),
    panel('details', [
      field('custom', { customConditional: 'show = data.choice === "yes"' }),
      required('mandatory'),
      {
        type: 'datagrid',
        input: true,
        tree: true,
        key: 'children',
        label: 'Children',
        components: [
          radio('hasName'),
          field('name', { customConditional: 'show = row.hasName === "yes"' }),
          field('nickname', { conditional: { show: true, when: 'hasName', eq: 'no' } }),
        ],
      },
    ]),
    panel('end', [required('last')], { conditional: { show: false, when: 'choice', eq: 'skip' } }),
  ],
};

const model = buildModel(form);
const check = (fills, options = {}) => checkFillSequence(model, { fills, ...options });

describe('checkFillSequence', () => {
  test('accepts fills in form order with their controlling fields first', () => {
    const result = check(
      [
        { path: 'choice', value: 'yes' },
        { path: 'shownForYes', value: 'a' },
        { path: 'other', value: 'b' },
        { path: 'mandatory', value: 'c' },
      ],
      { assume: {} },
    );
    assert.deepEqual(result.errors, []);
  });

  test('rejects a conditional field filled before its controlling field', () => {
    const { errors } = check([
      { path: 'shownForYes', value: 'a' },
      { path: 'choice', value: 'yes' },
    ]);
    assert.match(
      errors[0],
      /Fill 1 "shownForYes".*its visibility depends on "choice" \(choice\), which is filled later \(fill 2\)/,
    );
    assert.ok(errors.some((error) => /Fill 1 "shownForYes" \(shownForYes\) is not shown at this point/.test(error)));
  });

  test('rejects a field that its controlling value hides', () => {
    const { errors } = check([
      { path: 'choice', value: 'no' },
      { path: 'shownForYes', value: 'a' },
    ]);
    assert.match(
      errors.join('\n'),
      /"shownForYes" \(shownForYes\) is not shown at this point.*show when choice = "yes"/,
    );
  });

  test('rejects a field above the previous fill on the same page unless it is a revisit', () => {
    const fills = [
      { path: 'other', value: 'b' },
      { path: 'choice', value: 'no' },
    ];
    assert.match(
      check(fills).errors.join('\n'),
      /Fill 2 "choice" \(choice\) is above "other" \(other\) on page "start"/,
    );
    fills[1].revisit = true;
    assert.deepEqual(check(fills).errors, []);
  });

  test('rejects returning to an earlier page', () => {
    const { errors } = check(
      [
        { path: 'mandatory', value: 'c' },
        { path: 'other', value: 'b' },
      ],
      { leaveEmpty: [] },
    );
    assert.match(errors.join('\n'), /Fill 2 "other" \(other\) is on page "start", before page "details"/);
  });

  test('applies a layout group conditional and selectboxes values', () => {
    assert.match(
      check([{ path: 'inGroup', value: 'x' }]).errors.join('\n'),
      /"inGroup" \(inGroup\) is not shown.*navSkjemagruppe "Group" has "show when boxes = "b""/,
    );
    const { errors } = check([
      { path: 'boxes', value: { a: false, b: true } },
      { path: 'inGroup', value: 'x', revisit: true },
    ]);
    assert.deepEqual(errors, []);
  });

  test('requires an explicit assumption for a custom conditional and checks its dependencies', () => {
    const missing = check([
      { path: 'choice', value: 'yes' },
      { path: 'custom', value: 'x' },
      { path: 'mandatory', value: 'c' },
    ]);
    assert.match(
      missing.errors.join('\n'),
      /custom conditional that is not evaluated: show = data\.choice === "yes".*assume\["custom"\]/,
    );

    const assumed = check(
      [
        { path: 'choice', value: 'yes' },
        { path: 'custom', value: 'x' },
        { path: 'mandatory', value: 'c' },
      ],
      { assume: { custom: true } },
    );
    assert.deepEqual(assumed.errors, []);

    const hidden = check([{ path: 'custom', value: 'x' }], { assume: { custom: false } });
    assert.match(hidden.errors.join('\n'), /"custom" \(custom\) is not shown at this point/);
  });

  test('reports required fields shown but not filled, unless prefilled or deliberately empty', () => {
    const fills = [
      { path: 'choice', value: 'no' },
      { path: 'children[0].hasName', value: 'no' },
    ];
    assert.match(
      check(fills).errors.join('\n'),
      /Required field "mandatory" \(mandatory\) on page "details" is shown but not filled/,
    );
    assert.deepEqual(check(fills, { leaveEmpty: ['mandatory'] }).errors, []);
    assert.deepEqual(
      check([...fills.slice(0, 1), { path: 'mandatory', value: 'c', prefilled: true }, fills[1]]).errors,
      [],
    );
  });

  test('checks later pages only when the case reaches the summary, and skips hidden pages', () => {
    const fills = [
      { path: 'choice', value: 'no' },
      { path: 'mandatory', value: 'c' },
    ];
    assert.deepEqual(check(fills).errors, []);
    assert.match(
      check(fills, { reachesSummary: true }).errors.join('\n'),
      /Required field "last" \(last\) on page "end"/,
    );
    const skipped = [
      { path: 'choice', value: 'skip' },
      { path: 'mandatory', value: 'c' },
    ];
    assert.deepEqual(check(skipped, { reachesSummary: true }).errors, []);
  });

  test('orders datagrid rows and evaluates row-scoped conditionals per row', () => {
    const result = check(
      [
        { path: 'mandatory', value: 'c' },
        { path: 'children[0].hasName', value: 'no' },
        { path: 'children[0].nickname', value: 'Nick' },
        { path: 'children[1].hasName', value: 'yes' },
        { path: 'children[1].name', value: 'Ola' },
      ],
      { assume: { 'children[1].name': true } },
    );
    assert.deepEqual(result.errors, []);

    const wrongRow = check([
      { path: 'mandatory', value: 'c' },
      { path: 'children[0].hasName', value: 'yes' },
      { path: 'children[0].nickname', value: 'Nick' },
    ]);
    assert.match(wrongRow.errors.join('\n'), /"nickname" \(children\[0\]\.nickname\) is not shown at this point/);

    const backwards = check([
      { path: 'mandatory', value: 'c' },
      { path: 'children[1].hasName', value: 'no' },
      { path: 'children[0].hasName', value: 'no' },
    ]);
    assert.match(
      backwards.errors.join('\n'),
      /Fill 3 "hasName" \(children\[0\]\.hasName\) is above "hasName" \(children\[1\]\.hasName\)/,
    );
  });

  test('warns when a later fill hides and clears an earlier filled field', () => {
    const { warnings } = check([
      { path: 'choice', value: 'yes' },
      { path: 'shownForYes', value: 'a' },
      { path: 'choice', value: 'no', revisit: true },
    ]);
    assert.match(
      warnings.join('\n'),
      /Fill 3 "choice" \(choice\) hides the earlier filled "shownForYes" \(shownForYes\), which clears its value/,
    );
  });

  test('rejects unknown, ambiguous, and group paths', () => {
    const container = (key) => ({ type: 'container', input: true, tree: true, key, components: [field('same')] });
    const ambiguous = buildModel({ components: [panel('a', [container('c1')]), panel('b', [container('c2')])] });
    assert.match(
      checkFillSequence(ambiguous, { fills: [{ path: 'same', value: 1 }] }).errors[0],
      /matches several fields \(c1\.same, c2\.same\)/,
    );
    assert.match(check([{ path: 'missing', value: 1 }]).errors[0], /"missing" does not match a field/);
    assert.match(check([{ path: 'children', value: [] }]).errors[0], /is a datagrid group, not a field to fill/);
  });
});

test('extracts field references from custom conditionals without running them', () => {
  const { references, usesSubmissionMethod } = extractCustomReferences(
    "show = row.a.b && data['c'] && _.get(data, 'd.e') && utils.dataFetcher('f', submission).success && instance.isSubmissionPaper()",
  );
  assert.deepEqual(references, [
    { scope: 'row', path: 'a.b' },
    { scope: 'data', path: 'c' },
    { scope: 'data', path: 'd.e' },
    { scope: 'data', path: 'f' },
  ]);
  assert.equal(usesSubmissionMethod, true);
});

test('the CLI prints the structure and exits with 1 for an invalid sequence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'form-flow-test-'));
  try {
    const formFile = join(directory, 'form.json');
    const fillsFile = join(directory, 'fills.json');
    writeFileSync(formFile, JSON.stringify(form));
    writeFileSync(fillsFile, JSON.stringify({ fills: [{ path: 'shownForYes', value: 'a' }] }));
    const script = resolve(import.meta.dirname, 'form-flow.mjs');

    const structure = spawnSync(process.execPath, [script, '--form', formFile], { encoding: 'utf8' });
    assert.equal(structure.status, 0, structure.stderr);
    assert.match(structure.stdout, /Page 1: "start" \(start\)\n {2}- "choice" choice \[radiopanel\]/);
    assert.match(structure.stdout, /conditional: show when choice = "yes" \(depends on: choice\)/);
    assert.match(structure.stdout, /- "Group" \[navSkjemagruppe, layout\]/);
    assert.match(
      structure.stdout,
      /conditional: custom: show = row\.hasName === "yes" \(depends on: children\.hasName\)/,
    );

    const sequence = spawnSync(process.execPath, [script, '--form', formFile, '--fills', fillsFile], {
      encoding: 'utf8',
    });
    assert.equal(sequence.status, 1);
    assert.match(sequence.stdout, /Route:\n {2}Page "start":\n {4}1\. "shownForYes" \(shownForYes\) = "a"/);
    assert.match(sequence.stdout, /Errors:\n- Fill 1 "shownForYes" \(shownForYes\) is not shown at this point/);

    const usage = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    assert.equal(usage.status, 1);
    assert.match(usage.stderr, /provide exactly one of --form or --path/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
