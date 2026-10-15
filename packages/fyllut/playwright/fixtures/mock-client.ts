import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const restoreRouteVariants = async (adminURL: string) => {
  const response = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(10000),
  });
  if (response.status !== 204) {
    throw new Error(`Could not restore mock variants: HTTP ${response.status}`);
  }
};

const useRouteVariant = async (adminURL: string, id: string) => {
  const response = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(10000),
  });
  if (response.status !== 204) {
    throw new Error(`Could not select mock variant ${id}: HTTP ${response.status}`);
  }
  const selected = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!selected.ok) throw new Error(`Could not read mock variants: HTTP ${selected.status}`);
  const variants: unknown = await selected.json();
  if (!Array.isArray(variants) || !variants.includes(id)) {
    throw new Error(`Mock variant ${id} was not activated`);
  }
};

const checkRequestBodies = (path: string, ids: string[]) => {
  const records: { id: string; mismatches: string[] }[] = existsSync(path)
    ? readFileSync(path, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
  for (const record of records) {
    assert.deepEqual(record.mismatches, [], `Backend body mismatch in ${record.id}: ${record.mismatches.join(', ')}`);
  }
  for (const id of ids) {
    assert(
      records.some((record) => record.id === id),
      `Backend body was not validated by ${id}`,
    );
  }
};

export { checkRequestBodies, restoreRouteVariants, useRouteVariant };
