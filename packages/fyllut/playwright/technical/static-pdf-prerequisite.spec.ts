import { expect, test } from '../fixtures/test';
import { visitStaticPdfForm } from '../helpers/form';

test.use({ mockFault: 'missing-static-form' });

test(
  'missing-static-form',
  { annotation: { type: 'technical-id', description: 'missing-static-form' } },
  async ({ readyPage: page, request }, info) => {
    expect((await request.get('/fyllut/pdfstatic')).status()).toBe(404);
    await info.attach('action-started', { body: Buffer.from('missing-static-form'), contentType: 'text/plain' });
    await visitStaticPdfForm(page);
    throw new Error('MISSING_STATIC_FORM_FALSE_PASS');
  },
);
