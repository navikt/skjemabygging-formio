#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RenderError, fail } from './render/errors.mjs';
import { renderHtml } from './render/render-html.mjs';
import { renderInternalInstructions, renderIssue } from './render/render-markdown.mjs';
import { validatePlan } from './render/validate-plan.mjs';
import { collectGeneratedArtifacts, writeArtifacts } from './render/write-artifacts.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const skillDirectory = resolve(scriptDirectory, '..');

const helpText = `Usage:
  node render-artifacts.mjs --plan <plan.json> --out <directory> [--format <issue|html|both>]

Generates local index.html for manual printing, github-issue.md, or both,
plus manifest.json and any generated form files. No PDF is generated.

--format defaults to html when the plan collaborates with non-developers and
to issue otherwise. Plans that collaborate with non-developers only support html.
`;

const formats = {
  issue: ['github-issue.md'],
  html: ['index.html'],
  both: ['github-issue.md', 'index.html'],
};

const getArgument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const readPlan = (planPath) => {
  try {
    return JSON.parse(readFileSync(planPath, 'utf8'));
  } catch (error) {
    fail(`could not read plan JSON: ${error.message}`);
  }
};

const main = () => {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    process.stdout.write(helpText);
    process.exit(0);
  }

  const planArgument = getArgument('--plan');
  const outputArgument = getArgument('--out');
  if (process.argv.includes('--page-url')) {
    fail('--page-url is not supported; HTML plans are local');
  }

  if (!planArgument || !outputArgument) {
    fail('--plan and --out are required');
  }

  const planPath = resolve(planArgument);
  const outputDirectory = resolve(outputArgument);
  const planDirectory = dirname(planPath);

  const ctx = validatePlan(readPlan(planPath));
  const { plan } = ctx;
  const { withNonDevelopers } = plan.collaboration;

  const format = getArgument('--format') ?? (withNonDevelopers ? 'html' : 'issue');
  if (!Object.hasOwn(formats, format)) {
    fail('--format must be issue, html, or both');
  }
  if (withNonDevelopers && format !== 'html') {
    fail('plans that collaborate with non-developers only support --format html');
  }

  const generatedAt = new Date().toISOString();
  const renderers = {
    'github-issue.md': () => renderIssue(ctx),
    'index.html': () =>
      renderHtml(ctx, { generatedAt, templatePath: join(skillDirectory, 'templates', 'plan-page.html') }),
  };
  const internalInstructions = renderInternalInstructions(ctx);

  const artifactFiles = new Map(formats[format].map((name) => [name, renderers[name]()]));
  if (internalInstructions) {
    artifactFiles.set('internal-instructions.md', internalInstructions);
  }
  const generatedArtifacts = collectGeneratedArtifacts({ plan, planDirectory, outputDirectory });
  writeArtifacts({ plan, outputDirectory, artifactFiles, generatedArtifacts, generatedAt });

  if (artifactFiles.has('index.html')) {
    process.stdout.write(
      `No PDF generated. Open ${join(outputDirectory, 'index.html')}?print=1 in a browser and print to PDF.\n`,
    );
    if (existsSync(join(outputDirectory, 'test-plan.pdf'))) {
      process.stdout.write(
        'An unmanaged test-plan.pdf exists; rerendering did not update it. Reprint and review it.\n',
      );
    }
  }
  process.stdout.write(
    `Generated ${artifactFiles.size + 1 + generatedArtifacts.length} artifacts in ${outputDirectory}\n`,
  );
};

try {
  main();
} catch (error) {
  if (!(error instanceof RenderError)) {
    throw error;
  }
  process.stderr.write(`Error: ${error.message}\n`);
  process.exit(1);
}
