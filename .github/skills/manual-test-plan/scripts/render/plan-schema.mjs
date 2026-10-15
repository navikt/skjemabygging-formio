import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail } from './errors.mjs';

const schemaPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../references/plan.schema.json');

const ajv = new Ajv({ strict: true, strictRequired: false, strictTypes: false, verbose: true });
ajv.addKeyword('x-message');
const validateSchema = ajv.compile(JSON.parse(readFileSync(schemaPath, 'utf8')));

const toFieldPath = (instancePath) =>
  instancePath
    .split('/')
    .filter(Boolean)
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((path, part) => (/^\d+$/.test(part) ? `${path}[${part}]` : path ? `${path}.${part}` : part), '');

const describeError = (error) => {
  const path = toFieldPath(error.instancePath);
  if (error.keyword === 'required') {
    const field = error.params.missingProperty;
    return `${path ? `${path}.${field}` : field} is required`;
  }
  if (error.keyword === 'if') {
    return undefined;
  }
  const message = error.parentSchema?.['x-message'];
  if (message) {
    return `${path || 'plan'} ${message}`;
  }
  return `${path || 'plan'} ${error.message}`;
};

const validateAgainstSchema = (plan) => {
  if (validateSchema(plan)) {
    return;
  }
  const error = validateSchema.errors
    .map((candidate) => ({ candidate, text: describeError(candidate) }))
    .find(({ text }) => text);
  fail(error?.text ?? 'plan does not match the schema');
};

export { validateAgainstSchema };
