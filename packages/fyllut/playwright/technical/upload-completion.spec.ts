import { errors } from '@playwright/test';
import { expect, test } from '../fixtures/test';
import { prepareAttachmentSubmission } from '../helpers/attachments';

declare global {
  interface Window {
    __playwrightUpload?: {
      requests: number;
      held: boolean;
      consumed: boolean;
      continuedBeforeConsumption: boolean;
      continuedAfterConsumption: number;
      release: () => void;
    };
  }
}

test(
  'upload-completion',
  { annotation: { type: 'technical-id', description: 'upload-completion' } },
  async ({ readyPage: page }, info) => {
    expect(page.viewportSize()).toEqual({ width: 1280, height: 1000 });
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const state = {
        requests: 0,
        held: false,
        consumed: false,
        continuedBeforeConsumption: false,
        continuedAfterConsumption: 0,
        release,
      };
      window.__playwrightUpload = state;
      document.addEventListener(
        'click',
        (event) => {
          if (!(event.target instanceof Element) || !state.held) return;
          const control = event.target.closest('button, a');
          if (!/^(Lagre og fortsett|Save and continue)$/.test(control?.textContent?.trim() ?? '')) return;
          if (state.consumed) state.continuedAfterConsumption++;
          else state.continuedBeforeConsumption = true;
        },
        true,
      );
      window.fetch = async (input, init) => {
        const url = input instanceof Request ? input.url : String(input);
        const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
        const upload =
          method === 'POST' && /\/fyllut\/api\/send-inn\/digital-application\/[^/]+\/attachments\/[^/?]+$/.test(url);
        const number = upload ? ++state.requests : undefined;
        const response = await originalFetch(input, init);
        if (number === 4 && response.status === 201) {
          const json = response.json.bind(response);
          Object.defineProperty(response, 'json', {
            configurable: true,
            value: async () => {
              state.held = true;
              await gate;
              const body = await json();
              state.consumed = true;
              return body;
            },
          });
        }
        return response;
      };
    });
    await info.attach('action-started', { body: Buffer.from('upload-completion'), contentType: 'text/plain' });
    let settled = false;
    const preparation = prepareAttachmentSubmission(page).then(
      () => {
        settled = true;
        return { status: 'passed' as const };
      },
      (error: unknown) => {
        settled = true;
        return { status: 'failed' as const, error };
      },
    );
    const attachment = page.locator('[data-cy="attachment-upload"]').filter({ hasText: 'Annen dokumentasjon' });
    try {
      await expect(page.getByRole('heading', { level: 2, name: 'Vedlegg', exact: true })).toBeVisible();
      await page.waitForFunction(() => window.__playwrightUpload?.held);
      expect(await page.evaluate(() => window.__playwrightUpload?.requests)).toBe(4);
      await expect(attachment.getByText('test.txt', { exact: true })).toBeVisible();
      await expect(attachment.getByRole('button', { name: 'Slett filen', exact: true })).toHaveCount(0);
      // Observe forbidden navigation while the real response is held, then release it.
      await expect(
        page.waitForFunction(() => window.__playwrightUpload?.continuedBeforeConsumption, undefined, { timeout: 1000 }),
        'UPLOAD_NAVIGATION_BEFORE_READY',
      ).rejects.toBeInstanceOf(errors.TimeoutError);
      expect(settled, 'Upload preparation must still be waiting for application state').toBe(false);
      await expect(page.getByRole('heading', { level: 2, name: 'Vedlegg', exact: true })).toBeVisible();
      await expect(page.locator('[data-cy=error-summary]')).toHaveCount(0);
      await page.evaluate(() => window.__playwrightUpload!.release());
      const result = await preparation;
      if (result.status === 'failed') throw result.error;
      await expect(page.getByRole('heading', { level: 2, name: 'Oppsummering', exact: true })).toBeVisible();
      const state = await page.evaluate(() => ({
        requests: window.__playwrightUpload?.requests,
        held: window.__playwrightUpload?.held,
        consumed: window.__playwrightUpload?.consumed,
        continuedBeforeConsumption: window.__playwrightUpload?.continuedBeforeConsumption,
        continuedAfterConsumption: window.__playwrightUpload?.continuedAfterConsumption,
      }));
      expect(state).toEqual({
        requests: 4,
        held: true,
        consumed: true,
        continuedBeforeConsumption: false,
        continuedAfterConsumption: 1,
      });
      await info.attach('upload-completion-verified', {
        body: Buffer.from(JSON.stringify(state)),
        contentType: 'application/json',
      });
    } finally {
      await page.evaluate(() => window.__playwrightUpload?.release());
      await preparation;
    }
  },
);
