import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = 'https://forms-api.intern.dev.nav.no';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const defaultEnvFile = resolve(repositoryRoot, 'packages/bygger-backend/.env');
const generatedFormNumberPattern = /^MANUALTEST-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const isGeneratedFormNumber = (value) =>
  typeof value === 'string' && value.length <= 20 && generatedFormNumberPattern.test(value);

const fail = (message) => {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
};

const getArgument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};

const getToken = () => {
  const envFile = resolve(getArgument('--env-file') ?? defaultEnvFile);
  if (process.env.FORMS_API_ACCESS_TOKEN) {
    return process.env.FORMS_API_ACCESS_TOKEN;
  }
  if (existsSync(envFile)) {
    const tokenLines = readFileSync(envFile, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.includes('=') && line.slice(0, line.indexOf('=')).trim() === 'FORMS_API_ACCESS_TOKEN');
    const lastTokenLine = tokenLines.at(-1);
    if (lastTokenLine) {
      const value = lastTokenLine.slice(lastTokenLine.indexOf('=') + 1).trim();
      if (value) {
        return value;
      }
    }
  }
  fail(`FORMS_API_ACCESS_TOKEN is not set; run 'pnpm get-tokens forms-api' or set it in ${envFile}`);
};

export { baseUrl, fail, getArgument, getToken, isGeneratedFormNumber };
