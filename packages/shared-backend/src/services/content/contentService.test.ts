import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../shared/logger/logger';
import { createContentService } from './contentService';
import type { ContentSource } from './contentSource';

const baseUrl = 'http://forms-api.test';
const formPath = 'nav123456';
const form: Form = {
  id: 1,
  path: formPath,
  title: 'Published form',
  skjemanummer: 'NAV 12-34.56',
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['PAPER'],
    subsequentSubmissionTypes: ['PAPER'],
  },
  components: [],
  status: 'published',
  publishedLanguages: ['nn'],
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('createContentService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each<ContentSource>(['published', 'latest'])(
    'uses the %s source consistently for forms and both translation resources',
    async (source) => {
      const resource = source === 'published' ? 'form-publications' : 'forms';
      const globals =
        source === 'published' ? 'published-global-translations/en' : 'global-translations?languageCodes=en';
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        switch (url) {
          case `${baseUrl}/v1/${resource}/${formPath}`:
            return jsonResponse(form);
          case `${baseUrl}/v1/${resource}/${formPath}/translations?languageCodes=en`:
            return jsonResponse([{ key: 'Attachment', en: 'Form attachment' }]);
          case `${baseUrl}/v1/${globals}`:
            return jsonResponse(
              source === 'published'
                ? { Yes: 'Yes', Attachment: 'Global attachment' }
                : [
                    { key: 'Yes', en: 'Yes' },
                    { key: 'Attachment', en: 'Global attachment' },
                  ],
            );
          default:
            throw new Error(`Unexpected request: ${url}`);
        }
      });
      const service = createContentService({ baseUrl, source });

      await expect(service.getForm({ formPath })).resolves.toMatchObject({ ...form, languages: ['nb', 'nn'] });
      await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
        Yes: { en: 'Yes' },
        Attachment: { en: 'Form attachment' },
      });
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      for (const [url, options] of fetchSpy.mock.calls) {
        expect(String(url)).not.toContain('select=');
        expect(options).toMatchObject({
          method: 'GET',
          signal: expect.any(AbortSignal),
          headers: { 'x-correlation-id': expect.any(String) },
        });
      }
    },
  );

  it('immediately returns pending form and translation edits without trusting the previous publication', async () => {
    let revision = 1;
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      if (String(url).endsWith(`/${formPath}`)) {
        return jsonResponse({
          ...form,
          title: `Pending revision ${revision}`,
          status: 'pending',
          publicationId: 99,
        });
      }
      return jsonResponse([
        {
          key: String(url).includes('/global-translations') ? 'Yes' : 'Attachment',
          en: `Unpublished edit ${revision}`,
        },
      ]);
    });
    const service = createContentService({ baseUrl, source: 'latest' });

    await expect(service.getForm({ formPath })).resolves.toMatchObject({
      title: 'Pending revision 1',
      status: 'pending',
      languages: ['nb', 'nn', 'en'],
    });
    await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
      Attachment: { en: 'Unpublished edit 1' },
      Yes: { en: 'Unpublished edit 1' },
    });
    revision = 2;
    await expect(service.getForm({ formPath })).resolves.toMatchObject({ title: 'Pending revision 2' });
    await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
      Attachment: { en: 'Unpublished edit 2' },
      Yes: { en: 'Unpublished edit 2' },
    });
  });

  it.each<ContentSource>(['published', 'latest'])(
    'rejects a failed %s refresh instead of serving stale or empty translations and retries the next request',
    async (source) => {
      const success = source === 'published' ? { Yes: 'Yes' } : [{ key: 'Yes', en: 'Yes' }];
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(jsonResponse(success))
        .mockResolvedValueOnce(
          jsonResponse({ message: 'Private upstream metadata', correlationId: 'upstream-correlation' }, 503),
        )
        .mockResolvedValueOnce(jsonResponse(success));
      const warn = vi.spyOn(logger, 'warn');
      const service = createContentService({ baseUrl, source });

      await expect(service.getGlobalTranslations('en')).resolves.toMatchObject({ Yes: { en: 'Yes' } });
      await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Unable to load forms-api content',
        correlationId: 'upstream-correlation',
      });
      expect(JSON.stringify(warn.mock.calls)).not.toContain('Private upstream metadata');
      await expect(service.getGlobalTranslations('en')).resolves.toMatchObject({ Yes: { en: 'Yes' } });
    },
  );

  it.each(['getForm', 'getFormTranslations', 'getGlobalTranslations'] as const)(
    'bounds %s by five seconds and returns a standard dependency error',
    async (method) => {
      const timeout = vi.spyOn(AbortSignal, 'timeout');
      vi.spyOn(global, 'fetch').mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
      const service = createContentService({ baseUrl, source: 'latest' });
      const result =
        method === 'getGlobalTranslations' ? service[method]('en') : service[method]({ formPath, languageCode: 'en' });

      await expect(result).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
      expect(timeout).toHaveBeenCalledWith(5000);
    },
  );

  it('preserves a missing form as NOT_FOUND without exposing the upstream body', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(jsonResponse({ message: 'Private upstream metadata' }, 404));
    const service = createContentService({ baseUrl, source: 'published' });

    await expect(service.getForm({ formPath })).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
      message: 'Unable to load forms-api content',
    });
  });

  it('maps connection failures to SERVICE_UNAVAILABLE', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    const service = createContentService({ baseUrl, source: 'latest' });

    await expect(service.getForm({ formPath })).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });

  it('fails explicitly when the timeout expires while reading the response body', async () => {
    const controller = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const body = new ReadableStream({
      start: (streamController) => {
        controller.signal.addEventListener('abort', () => streamController.error(controller.signal.reason));
      },
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, { headers: { 'Content-Type': 'application/json' } }),
    );
    const service = createContentService({ baseUrl, source: 'published' });
    const result = service.getGlobalTranslations('en');
    controller.abort(new DOMException('Timed out', 'TimeoutError'));

    await expect(result).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });

  it('rejects malformed success responses rather than returning empty content', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => jsonResponse(null));
    const service = createContentService({ baseUrl, source: 'latest' });

    await expect(service.getForm({ formPath })).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    await expect(service.getFormTranslations({ formPath, languageCode: 'en' })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
    });
    await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });

  it('rejects unknown sources from untyped callers', () => {
    expect(() => createContentService(JSON.parse('{"baseUrl":"http://forms-api.test","source":"static"}'))).toThrow(
      'Content source must be published or latest',
    );
  });

  it.each([{ body: [{ key: 'Yes', en: { private: 'metadata' } }] }, { body: [null] }, { body: [{}] }])(
    'rejects malformed translation rows: %j',
    async ({ body }) => {
      vi.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(body));
      const service = createContentService({ baseUrl, source: 'latest' });

      await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    },
  );

  it('rejects non-JSON published translations instead of silently returning an empty map', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('not json'));
    const service = createContentService({ baseUrl, source: 'published' });

    await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });
});
