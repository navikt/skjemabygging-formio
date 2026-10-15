import { expect, test } from '../fixtures/test';
import { downloadApplication, nextStep, visitForm } from '../helpers/form';

test.use({ mockFault: 'hold-pdf' });

test(
  'download-response',
  { annotation: { type: 'technical-id', description: 'download-response' } },
  async ({ readyPage: page, epoch, request }, info) => {
    await visitForm(page, '/fyllut/bankaccount/visning?sub=paper');
    await page.getByRole('textbox', { name: 'Kontonummer', exact: true }).pressSequentially('01234567892');
    await page.getByRole('textbox', { name: 'Kontonummer med beskrivelse' }).pressSequentially('01234567892');
    await nextStep(page);
    await expect(page.getByRole('heading', { name: 'Validering' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Kontonummer påkrevd' }).pressSequentially('01234567892');
    await nextStep(page);
    await expect(page.getByRole('heading', { name: 'Oppsummering' })).toBeVisible();
    await page
      .getByRole('button', { name: 'Instruksjoner for innsending' })
      .or(page.getByRole('link', { name: 'Instruksjoner for innsending' }))
      .click();

    const headers = { 'x-playwright-epoch': epoch.epochId, 'x-playwright-owner': 'download-response' };
    const root = `${epoch.mockURL}/__playwright`;
    expect(
      (await request.post(`${root}/claim`, { headers, data: { 'post-familie-pdf': 'success-tc07' } })).status(),
    ).toBe(201);
    await info.attach('action-started', { body: Buffer.from('download-response'), contentType: 'text/plain' });
    const outcome = downloadApplication(page).then(
      () => undefined,
      (error: unknown) => error,
    );
    expect((await request.get(`${root}/wait-for-pdf`, { headers })).status()).toBe(200);
    const snapshot: unknown = await (await request.get(`${root}/snapshot`, { headers })).json();
    expect(snapshot).toMatchObject({
      records: [expect.objectContaining({ routeId: 'post-familie-pdf', response: 'pending', status: null })],
    });
    await page.close();
    expect(await outcome).toMatchObject({
      message: expect.stringMatching(
        /^(?:PDF_DOWNLOAD_RESPONSE_MISSING|request\.response: Target page, context or browser has been closed)$/,
      ),
    });
    expect((await request.post(`${root}/release`, { headers })).status()).toBe(204);
    await info.attach('held-download-rejected', {
      body: Buffer.from(JSON.stringify(snapshot)),
      contentType: 'application/json',
    });
  },
);
