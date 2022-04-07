import { MigrationOptions } from "../../types/migration";
import { createUrlParams } from "./utils";

async function postJson(url, bodyAsJSON) {
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(bodyAsJSON),
  });
  return result.json();
}

export async function runMigrationDryRun(searchFilters: MigrationOptions, editOptions: MigrationOptions) {
  try {
    const response = await fetch(`/api/migrate${createUrlParams(searchFilters, editOptions)}`, {
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
    return postJson("/api/migrate/update", { token, payload });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function bulkPublish(token, payload) {
  try {
    return postJson("/api/publish-bulk", { token, payload });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
