#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createFormsApiClient } from './client.mjs';
import { fail, getArgument, getToken } from './common.mjs';
import {
  buildModel,
  groupTypes,
  checkFillSequence,
  concretePath,
  describeConditional,
  describeForm,
} from './form-flow-model.mjs';

const helpText = `Usage:
  node form-flow.mjs (--form <form.json> | --path <form-path>) [--fills <fills.json>] [--env-file <path>]

Without --fills, prints the form's pages and fields in rendering order with
their conditionals. With --fills, checks a planned fill sequence against that
order and the conditionals, then prints the resulting route. Exits with 1 when
the sequence has errors.

--form reads a local form definition. --path reads the current revision from
preprod Forms API.

Fills file:
  {
    "reachesSummary": false,
    "leaveEmpty": ["<required field the case deliberately leaves empty>"],
    "assume": { "<path or key with a custom conditional>": true },
    "fills": [
      { "path": "<data path or unique key>", "value": <submission value> },
      { "path": "children[1].firstName", "value": "Ola" },
      { "path": "<path>", "value": <value>, "prefilled": true },
      { "path": "<path>", "value": <value>, "revisit": true }
    ]
  }

Required fields are checked on every shown page up to the last fill. Set
"reachesSummary": true when the case continues to the summary, so all later
pages are checked too.

Custom JavaScript conditionals are never executed. Read the expression and
record whether it shows the component in "assume".
`;

const readJson = (path, description) => {
  try {
    return JSON.parse(readFileSync(resolve(path), 'utf8'));
  } catch (error) {
    fail(`could not read ${description}: ${error.message}`);
  }
};

const loadForm = async () => {
  const formFile = getArgument('--form');
  const formPath = getArgument('--path')?.trim();
  if (Boolean(formFile) === Boolean(formPath)) {
    fail('provide exactly one of --form or --path');
  }
  if (formFile) {
    return readJson(formFile, 'form JSON');
  }
  const { request } = createFormsApiClient(getToken());
  const { body } = await request(`/v1/forms/${encodeURIComponent(formPath)}`);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(`Forms API returned an invalid form for ${formPath}`);
  }
  return body;
};

const formatValue = (value) => (value === undefined ? '' : ` = ${JSON.stringify(value)}`);

const printStructure = (model) => {
  const lines = [];
  for (const { page, conditionals, fields } of describeForm(model)) {
    const flags = [page.isAttachmentPanel ? 'attachment panel' : '', page.isPanel ? '' : `top-level ${page.node?.type}`]
      .filter(Boolean)
      .join(', ');
    lines.push(`Page ${page.index + 1}: "${page.title}" (${page.key})${flags ? ` [${flags}]` : ''}`);
    for (const conditional of conditionals) {
      lines.push(`  conditional: ${describeConditional(conditional)}`);
    }
    for (const { node, depth, conditionals: fieldConditionals } of fields) {
      const indent = '  '.repeat(depth + 1);
      const flagsText = [
        node.type,
        node.isFillable && node.required ? 'required' : '',
        node.component.clearOnHide === false ? 'keeps value when hidden' : '',
      ]
        .filter(Boolean)
        .join(', ');
      lines.push(
        node.isFillable || groupTypes.has(node.type)
          ? `${indent}- "${node.label}" ${node.path} [${flagsText}]`
          : `${indent}- "${node.label}" [${node.type}, layout]`,
      );
      for (const conditional of fieldConditionals) {
        const dependencies = (conditional.dependencies ?? [])
          .map((dependency) => dependency.resolved?.node.path ?? `${dependency.path} (not found)`)
          .join(', ');
        lines.push(
          `${indent}    conditional: ${describeConditional(conditional)}${dependencies ? ` (depends on: ${dependencies})` : ''}${conditional.usesSubmissionMethod ? ' (depends on submission method)' : ''}`,
        );
      }
    }
  }
  return lines.join('\n');
};

const printRoute = (model, result) => {
  const lines = ['Route:'];
  let currentPage;
  for (const step of result.steps) {
    if (step.page !== currentPage) {
      for (const { page, uncertain } of result.pagesVisited) {
        if (page.index > (currentPage?.index ?? -1) && page.index < step.page.index) {
          lines.push(`  Page "${page.title}": no fills${uncertain ? ' (shown if its custom conditional is met)' : ''}`);
        }
      }
      currentPage = step.page;
      lines.push(`  Page "${currentPage.title}":`);
    }
    const flags = [step.fill.prefilled ? 'prefilled' : '', step.fill.revisit ? 'revisit' : ''].filter(Boolean);
    lines.push(
      `    ${step.index}. "${step.node.label}" (${concretePath(step.node, step.rows)})${formatValue(step.fill.value)}${flags.length ? ` [${flags.join(', ')}]` : ''}`,
    );
  }
  return lines.join('\n');
};

const main = async () => {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.stdout.write(helpText);
    return;
  }
  const form = await loadForm();
  if (!Array.isArray(form.components)) {
    fail('form definition has no components array');
  }
  const model = buildModel(form);
  const header = [form.title, form.skjemanummer, form.revision === undefined ? '' : `revision ${form.revision}`]
    .filter((value) => value !== undefined && value !== '')
    .join(', ');
  process.stdout.write(`Form: ${header || '(untitled)'}\n\n`);

  const fillsFile = getArgument('--fills');
  if (!fillsFile) {
    process.stdout.write(`${printStructure(model)}\n`);
    return;
  }
  const fills = readJson(fillsFile, 'fills JSON');
  if (!fills || !Array.isArray(fills.fills)) {
    fail('fills JSON must contain a fills array');
  }
  const result = checkFillSequence(model, {
    fills: fills.fills,
    assume: fills.assume ?? {},
    leaveEmpty: fills.leaveEmpty ?? [],
    reachesSummary: fills.reachesSummary === true,
  });
  if (result.steps.length) {
    process.stdout.write(`${printRoute(model, result)}\n`);
  }
  for (const [title, messages] of [
    ['Errors', result.errors],
    ['Warnings', result.warnings],
  ]) {
    if (messages.length) {
      process.stdout.write(`\n${title}:\n${messages.map((message) => `- ${message}`).join('\n')}\n`);
    }
  }
  if (!result.errors.length) {
    process.stdout.write('\nThe fill sequence matches the form order and conditionals.\n');
  }
  process.exitCode = result.errors.length ? 1 : 0;
};

await main();
