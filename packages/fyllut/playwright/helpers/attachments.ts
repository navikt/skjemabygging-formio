import { expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { saveAndContinue, visitForm } from './form';

const visitAttachments = async (page: Page) => {
  await visitForm(page, '/fyllut/formwithattachments?sub=digital');
  await page.getByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).check();
  await saveAndContinue(page);
  await expect(page.getByRole('heading', { name: 'Dine opplysninger' })).toBeVisible();
  await saveAndContinue(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Diverse' })).toBeVisible();
  await page
    .getByRole('group', { name: /Radiopanel 1/ })
    .getByLabel('Radiovalg 1')
    .check();
  await saveAndContinue(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Vedlegg' })).toBeVisible();
};

const prepareAttachmentSubmission = async (page: Page) => {
  await visitAttachments(page);
  const uploads = [
    { name: 'Vedlegg 1', file: 'small-file.txt' },
    { name: 'Vedlegg 2', file: 'another-small-file.txt' },
    { name: 'Vedlegg upload-only', file: 'test.txt' },
    { name: 'Annen dokumentasjon', file: 'test.txt' },
  ];
  for (const { name, file } of uploads) {
    const attachment = page.locator('[data-cy="attachment-upload"]').filter({ hasText: name });
    if (name !== 'Vedlegg upload-only') {
      await attachment.getByRole('radio', { name: 'Jeg laster opp dette nå' }).check();
    }
    if (name === 'Annen dokumentasjon') {
      await attachment.getByLabel('Gi vedlegget et beskrivende navn').fill('Annet vedlegg 1');
    }
    const uploaded = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/fyllut\/api\/send-inn\/digital-application\/[^/]+\/attachments\/[^/?]+$/.test(response.url()),
    );
    await attachment
      .locator('input[type="file"]')
      .setInputFiles(resolve(import.meta.dirname, '../../cypress/fixtures/files', file));
    expect((await uploaded).status()).toBe(201);
    await expect(attachment.getByText(file, { exact: true })).toBeVisible();
  }
  await saveAndContinue(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering' })).toBeVisible();
};

const sendToNav = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Send til Nav', exact: true })
    .or(page.getByRole('link', { name: 'Send til Nav', exact: true }))
    .click();
};

export { prepareAttachmentSubmission, sendToNav, visitAttachments };
