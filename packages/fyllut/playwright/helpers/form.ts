import { expect, type Locator, type Page } from '@playwright/test';

const expectVisibleToUser = async (locator: Locator) => {
  await expect(locator).toBeVisible();
  await expect(locator).not.toContainClass('aksel-sr-only');
};

const expectSummaryGroup = async (
  page: Page,
  heading: string,
  answers: ReadonlyArray<{ label: string; value: string }>,
) => {
  const group = page
    .getByTestId('form-summary-panel')
    .filter({ has: page.getByRole('heading', { level: 3, name: heading, exact: true }) });
  await expect(group).toHaveCount(1);
  for (const [index, { label, value }] of answers.entries()) {
    await expect(group.getByRole('term').nth(index)).toContainText(label);
    await expect(group.getByRole('definition').nth(index)).toContainText(value);
  }
};

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
  await page.getByRole('button', { name: /^(Neste steg|Next step)$/ }).click();
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
  const sent = await request;
  const payload: unknown = sent.postDataJSON();
  expect(payload && typeof payload === 'object' && !Array.isArray(payload)).toBeTruthy();
  const body = payload as { submission?: string; formPath?: string };
  expect(body.submission).toBeTruthy();
  expect(body.formPath).toBeTruthy();
  const submission: unknown = JSON.parse(body.submission!);
  expect(submission && typeof submission === 'object' && 'data' in submission).toBeTruthy();
  const data = (submission as { data: unknown }).data;
  expect(data && typeof data === 'object' && Object.keys(data).length).toBeTruthy();
  const response = await sent.response();
  if (!response) throw new Error('PDF_DOWNLOAD_RESPONSE_MISSING');
  const error = await response.finished();
  if (error) throw new Error('PDF_DOWNLOAD_RESPONSE_INCOMPLETE', { cause: error });
};

const visitStaticPdfForm = async (page: Page) => {
  const available = await page.request.get('/fyllut/pdfstatic/pdf');
  expect(available.status(), 'STATIC_PDF_PAGE_REQUIRED').toBe(200);
  const staticPdf = page.waitForResponse(
    (response) =>
      response.url().includes('/fyllut/api/forms/pdfstatic/static-pdfs') && response.request().method() === 'GET',
  );
  await Promise.all([
    visitForm(page, '/fyllut/pdfstatic/pdf'),
    staticPdf.then((response) => expect(response.ok(), 'STATIC_PDF_LIST_REQUIRED').toBeTruthy()),
  ]);
  await expect(page.getByRole('textbox', { name: /Fødselsnummer eller d-nummer/ })).toBeVisible();
};

export {
  downloadApplication,
  expectSummaryGroup,
  expectVisibleToUser,
  nextStep,
  showAllSteps,
  visitForm,
  visitStaticPdfForm,
};
