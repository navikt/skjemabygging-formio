import { MigrationLevel } from '@navikt/skjemadigitalisering-shared-domain';
import { MigrationOptions } from '../../types/migration';
import { createUrlParams } from './utils';

async function postJson(url, bodyAsJSON) {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
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
  formSearchFilters: MigrationOptions,
  searchFilters: MigrationOptions,
  dependencyFilters: MigrationOptions,
  editOptions: MigrationOptions,
  migrationLevel: MigrationLevel,
) {
  try {
    const response = await fetch(
      `/api/migrate${createUrlParams(
        formSearchFilters,
        searchFilters,
        dependencyFilters,
        editOptions,
        migrationLevel,
      )}`,
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

export async function runMigrationWithUpdate(payload) {
  try {
    return postJson('/api/migrate/update', { payload });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function bulkPublish(payload) {
  try {
    return postJson('/api/form-publications', { payload });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
