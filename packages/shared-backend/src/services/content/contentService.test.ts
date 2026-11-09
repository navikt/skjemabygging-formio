import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../shared/logger/logger';
import { createContentService } from './contentService';
import type { ContentSource } from './contentSource';

const baseUrl = 'http://forms-api.test';
const formPath = 'nav123456';
const cacheTtlMs = 5 * 60 * 1000;
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

  it.each([
    {
      source: 'published',
      formUrl: `${baseUrl}/v1/form-publications/${formPath}`,
      formTranslationsUrl: `${baseUrl}/v1/form-publications/${formPath}/translations?languageCodes=en`,
      formTranslations: {
        publishedAt: '2026-01-01',
        publishedBy: 'Publisher',
        translations: { en: { Attachment: 'Form attachment' } },
      },
      globalTranslationsUrl: `${baseUrl}/v1/published-global-translations/en`,
      globalTranslations: { Yes: 'Yes', Attachment: 'Global attachment', required: 'You must fill in: {{field}}' },
    },
    {
      source: 'latest',
      formUrl: `${baseUrl}/v1/forms/${formPath}`,
      formTranslationsUrl: `${baseUrl}/v1/forms/${formPath}/translations?languageCodes=en`,
      formTranslations: [{ key: 'Attachment', en: 'Form attachment' }],
      globalTranslationsUrl: `${baseUrl}/v1/global-translations?languageCodes=en`,
      globalTranslations: [
        { key: 'Yes', en: 'Yes' },
        { key: 'Attachment', en: 'Global attachment' },
        { key: 'required', en: 'You must fill in: {{field}}' },
      ],
    },
  ] satisfies Array<{ source: ContentSource } & Record<string, unknown>>)(
    'uses the $source source consistently for forms and both translation resources',
    async ({ source, formUrl, formTranslationsUrl, formTranslations, globalTranslationsUrl, globalTranslations }) => {
      const responses: Record<string, unknown> = {
        [formUrl]: form,
        [formTranslationsUrl]: formTranslations,
        [globalTranslationsUrl]: globalTranslations,
      };
      const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
        if (!(String(url) in responses)) throw new Error(`Unexpected request: ${url}`);
        return jsonResponse(responses[String(url)]);
      });
      const service = createContentService({ baseUrl, source });

      await expect(service.getForm({ formPath })).resolves.toMatchObject({ ...form, languages: ['nb', 'nn'] });
      await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
        Yes: { en: 'Yes' },
        Attachment: { en: 'Form attachment' },
        [TEXTS.validering.required]: { nb: TEXTS.validering.required, en: 'You must fill in: {{field}}' },
      });
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      for (const [, options] of fetchSpy.mock.calls) {
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

  it('caches published content per form and language for five minutes', async () => {
    let revision = 1;
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const path = String(url);
      if (path.endsWith(`/${formPath}`)) return jsonResponse({ ...form, title: `Revision ${revision}` });
      if (path.includes('/published-global-translations/')) return jsonResponse({ Yes: `Global ${revision}` });
      const languageCode = new URL(path).searchParams.get('languageCodes') as string;
      return jsonResponse({ translations: { [languageCode]: { Attachment: `Form ${revision}` } } });
    });
    const now = vi.spyOn(Date, 'now').mockReturnValue(0);
    const service = createContentService({ baseUrl, source: 'published' });

    const [first] = await Promise.all([service.getForm({ formPath }), service.getForm({ formPath })]);
    first.title = 'Changed by caller';
    await service.getTranslations({ formPath, languageCode: 'en' });
    revision = 2;
    now.mockReturnValue(cacheTtlMs - 1);

    await expect(service.getForm({ formPath })).resolves.toMatchObject({ title: 'Revision 1' });
    await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
      Yes: { en: 'Global 1' },
      Attachment: { en: 'Form 1' },
    });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    await expect(service.getTranslations({ formPath, languageCode: 'nn' })).resolves.toMatchObject({
      Attachment: { nn: 'Form 2' },
    });

    now.mockReturnValue(cacheTtlMs);
    await expect(service.getForm({ formPath })).resolves.toMatchObject({ title: 'Revision 2' });
    await expect(service.getTranslations({ formPath, languageCode: 'en' })).resolves.toMatchObject({
      Yes: { en: 'Global 2' },
      Attachment: { en: 'Form 2' },
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
      const now = vi.spyOn(Date, 'now').mockReturnValue(0);
      const service = createContentService({ baseUrl, source });

      await expect(service.getGlobalTranslations('en')).resolves.toMatchObject({ Yes: { en: 'Yes' } });
      now.mockReturnValue(cacheTtlMs);
      await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Unable to load global translations',
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
      message: 'Unable to load form',
    });
  });

  it('maps connection failures to SERVICE_UNAVAILABLE and logs the failing resource', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    const warn = vi.spyOn(logger, 'warn');
    const service = createContentService({ baseUrl, source: 'latest' });

    await expect(service.getForm({ formPath })).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    expect(warn).toHaveBeenCalledWith('Unable to load form', {
      resource: 'form',
      source: 'latest',
      errorName: 'TypeError',
    });
  });

  it.each(['.', '..', 'NAV123456', 'nav123456/translations'])(
    'rejects the invalid form path %j before calling forms-api',
    async (invalidPath) => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(jsonResponse({}));
      const service = createContentService({ baseUrl, source: 'published' });

      await expect(service.getForm({ formPath: invalidPath })).rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
      await expect(service.getTranslations({ formPath: invalidPath, languageCode: 'en' })).rejects.toMatchObject({
        errorCode: 'BAD_REQUEST',
      });
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

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

  it('rejects empty success responses rather than returning empty content', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => jsonResponse(null));
    const service = createContentService({ baseUrl, source: 'latest' });

    await expect(service.getForm({ formPath })).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    await expect(service.getFormTranslations({ formPath, languageCode: 'en' })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
    });
    await expect(service.getGlobalTranslations('en')).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });

  it('returns an empty map when the form has no published translations for the language', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(jsonResponse({ translations: {} }));
    const service = createContentService({ baseUrl, source: 'published' });

    await expect(service.getFormTranslations({ formPath, languageCode: 'en' })).resolves.toEqual({});
  });
});
