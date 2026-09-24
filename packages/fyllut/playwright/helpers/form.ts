import { expect, type Page } from '@playwright/test';

const visitForm = async (page: Page, path: string) => {
  const config = page.waitForResponse(
    (response) => response.url().includes('/fyllut/api/config') && response.request().method() === 'GET',
  );
  const form = page.waitForResponse(
    (response) => /\/fyllut\/api\/forms\/[^/?]+(?:\?|$)/.test(response.url()) && response.request().method() === 'GET',
  );
  const translations = page.waitForResponse(
    (response) =>
      /\/fyllut\/api\/(?:translations\/[^/]+|forms\/[^/]+\/translations)(?:\?|$)/.test(response.url()) &&
      response.request().method() === 'GET',
  );
  await page.goto(path);
  for (const response of await Promise.all([config, form, translations])) {
    expect(response.ok(), `Loading ${response.url()}`).toBeTruthy();
  }
};

const nextStep = async (page: Page) => {
  await page
    .getByRole('button', { name: /^(Neste steg|Next step)$/ })
    .or(page.getByRole('link', { name: /^(Neste steg|Next step)$/ }))
    .click();
};

const showAllSteps = async (page: Page) => {
  await page.getByRole('button', { name: /Vis alle steg|Show all steps/ }).click();
  await expect(page.locator('.aksel-form-progress__collapsible')).toHaveAttribute('data-state', 'open');
  await expect(page.locator('.aksel-form-progress__collapsible')).toHaveCSS('opacity', '1');
};

const downloadApplication = async (page: Page) => {
  const request = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().includes('/fyllut/api/documents/cover-page-and-application'),
  );
  await page.getByRole('button', { name: /^(Last ned skjema|Download form)$/ }).click();
  const payload: unknown = (await request).postDataJSON();
  expect(payload && typeof payload === 'object' && !Array.isArray(payload)).toBeTruthy();
  const body = payload as { submission?: string; formPath?: string };
  expect(body.submission).toBeTruthy();
  expect(body.formPath).toBeTruthy();
  const submission: unknown = JSON.parse(body.submission!);
  expect(submission && typeof submission === 'object' && 'data' in submission).toBeTruthy();
  const data = (submission as { data: unknown }).data;
  expect(data && typeof data === 'object' && Object.keys(data).length).toBeTruthy();
};

export { downloadApplication, nextStep, showAllSteps, visitForm };
