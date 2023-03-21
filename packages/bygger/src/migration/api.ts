import { MigrationOptions } from "../../types/migration";
import { createUrlParams } from "./utils";

async function postJson(url, bodyAsJSON, token) {
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Bygger-Formio-Token": token,
    },
    body: JSON.stringify(bodyAsJSON),
  });
  return result.json();
}

export async function runMigrationDryRun(
  searchFilters: MigrationOptions,
  dependencyFilters: MigrationOptions,
  editOptions: MigrationOptions
) {
  try {
    const response = await fetch(`/api/migrate${createUrlParams(searchFilters, dependencyFilters, editOptions)}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
    return {};
  }
}

export async function runMigrationWithUpdate(token, payload) {
  try {
    return postJson("/api/migrate/update", { payload }, token);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function bulkPublish(token, payload) {
  try {
    return postJson("/api/published-forms", { payload }, token);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
