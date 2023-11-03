import { MigrationLevel } from '@navikt/skjemadigitalisering-shared-domain';
import { MigrationOptions } from '../../types/migration';
import { createUrlParams } from './utils';

async function postJson(url, bodyAsJSON, token) {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Bygger-Formio-Token': token,
    },
    body: JSON.stringify(bodyAsJSON),
  });
  if (!result.ok) {
    const error = await result.text();
    throw new Error(error);
  }
  return result.json();
}

export async function runMigrationDryRun(
  searchFilters: MigrationOptions,
  dependencyFilters: MigrationOptions,
  editOptions: MigrationOptions,
  migrationLevel: MigrationLevel,
) {
  try {
    const response = await fetch(
      `/api/migrate${createUrlParams(searchFilters, dependencyFilters, editOptions, migrationLevel)}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
}

export async function runMigrationWithUpdate(token, payload) {
  try {
    return postJson('/api/migrate/update', { payload }, token);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function bulkPublish(token, payload) {
  try {
    return postJson('/api/published-forms', { payload }, token);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
