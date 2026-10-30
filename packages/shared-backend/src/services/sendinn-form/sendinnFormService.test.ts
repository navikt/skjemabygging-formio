import { FormWithLanguages, ResponseError, SendinnFormRequest } from '@navikt/skjemadigitalisering-shared-domain';
import { createSendinnFormService } from './sendinnFormService';

const createForm = (): FormWithLanguages => ({
  path: 'nav123456',
  title: 'Source application',
  skjemanummer: 'NAV 12-34.56',
  revision: 3,
  status: 'published',
  publicationId: 'publication-3',
  publishedLanguages: ['en'],
  languages: ['nb', 'en'],
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['PAPER'],
    subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
  },
  components: [
    { type: 'textfield', key: 'applicationQuestion', label: 'Application only' },
    { type: 'attachment', key: 'first', label: 'First document', properties: { vedleggskode: 'N1' } },
    { type: 'attachment', key: 'second', label: 'Second document', properties: { vedleggskode: 'N2' } },
  ],
});

describe('createSendinnFormService', () => {
  const getForm = vi.fn();
  const getTranslations = vi.fn();
  const service = createSendinnFormService({ contentService: { getForm, getTranslations } });
  const request: SendinnFormRequest = { formPath: 'nav123456', language: 'nb', attachmentFilter: [] };

  beforeEach(() => {
    vi.resetAllMocks();
    getForm.mockResolvedValue(createForm());
    getTranslations.mockResolvedValue({ 'First document': { en: 'First translated document' } });
  });

  it('loads the trusted source, converts only the available attachments and preserves language and publication metadata', async () => {
    const source = createForm();
    source.properties.submissionTypes = ['DIGITAL'];
    const original = structuredClone(source);
    getForm.mockResolvedValue(source);

    const result = await service.getForm({ ...request, language: 'en', attachmentFilter: ['N2'] });

    expect(getForm).toHaveBeenCalledWith({ formPath: request.formPath });
    expect(getTranslations).toHaveBeenCalledWith({ formPath: request.formPath, languageCode: 'en' });
    expect(result).toMatchObject({
      language: 'en',
      languages: ['nb', 'en'],
      attachmentFilter: ['N2'],
      translations: { 'First document': { en: 'First translated document' } },
      form: {
        revision: 3,
        publicationId: 'publication-3',
        publishedLanguages: ['en'],
        properties: { submissionTypes: ['PAPER'] },
      },
    });
    expect(result.form.components.at(-1)?.components).toMatchObject([
      { key: 'sendinnAttachment2', components: [{ key: 'second', label: 'Second document' }] },
    ]);
    expect(JSON.stringify(result.form.components)).not.toContain('applicationQuestion');
    expect(source).toEqual(original);
  });

  it.each([undefined, [], ['DIGITAL'], 'PAPER'] as const)(
    'rejects source subsequentSubmissionTypes %j',
    async (types) => {
      const form = createForm();
      form.properties.submissionTypes = ['PAPER'];
      Object.assign(form.properties, { subsequentSubmissionTypes: types });
      getForm.mockResolvedValue(form);

      await expect(service.getForm(request)).rejects.toMatchObject({ errorCode: 'NOT_FOUND' });
      expect(getTranslations).not.toHaveBeenCalled();
    },
  );

  it('falls back to Bokmål for an unpublished language without requesting its translations', async () => {
    const result = await service.getForm({ ...request, language: 'nn' });
    expect(result).toMatchObject({ language: 'nb', languages: ['nb', 'en'], translations: {} });
    expect(getTranslations).not.toHaveBeenCalled();
  });

  it('retains the successful no-matching-documents state instead of restoring all choices', async () => {
    const result = await service.getForm({ ...request, attachmentFilter: ['unknown'] });
    expect(result.form.components.at(-1)).toMatchObject({ key: 'sendinnAttachments', components: [] });
    expect(result.attachmentFilter).toEqual(['unknown']);
  });

  it.each(['NOT_FOUND', 'SERVICE_UNAVAILABLE'] as const)(
    'preserves a correlated %s form failure',
    async (errorCode) => {
      const error = new ResponseError(errorCode, 'Unable to load forms-api content', 'upstream-form-id');
      getForm.mockRejectedValue(error);

      await expect(service.getForm(request)).rejects.toBe(error);
      expect(getTranslations).not.toHaveBeenCalled();
    },
  );

  it('preserves a correlated translation outage rather than returning an empty form', async () => {
    const error = new ResponseError(
      'SERVICE_UNAVAILABLE',
      'Unable to load forms-api content',
      'upstream-translations-id',
    );
    getTranslations.mockRejectedValue(error);
    await expect(service.getForm({ ...request, language: 'en' })).rejects.toBe(error);
  });

  it('does not interpret missing translations as a missing form', async () => {
    getTranslations.mockRejectedValue(
      new ResponseError('NOT_FOUND', 'Missing translations', 'upstream-translations-id'),
    );
    await expect(service.getForm({ ...request, language: 'en' })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      correlationId: 'upstream-translations-id',
    });
  });

  it.each(['identity', 'languages'])('rejects invalid trusted %s metadata', async (field) => {
    const source = createForm();
    if (field === 'identity') source.path = 'anotherform';
    else source.languages = undefined;
    getForm.mockResolvedValue(source);

    await expect(service.getForm(request)).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });
});
