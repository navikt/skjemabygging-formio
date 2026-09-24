import { Form, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { IntegrationHttp } from '@navikt/skjemadigitalisering-shared-frontend';
import { describe, expect, it, vi } from 'vitest';
import createRenderFormBootstrapService from './createRenderFormBootstrapService';

vi.mock('@navikt/skjemadigitalisering-shared-components', () => ({
  formUtils: { getPanelSlug: () => 'first-page' },
}));

const form: Form = {
  path: 'test-form',
  title: 'Test form',
  skjemanummer: 'TEST',
  components: [],
  properties: {
    skjemanummer: 'TEST',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: [],
  },
};

const setup = () => {
  const http: Pick<IntegrationHttp, 'get'> = {
    get: async () => {
      throw new Error('Unexpected request');
    },
  };
  const get = vi.spyOn(http, 'get');
  const service = createRenderFormBootstrapService({ http, backendBaseUrl: '/fyllut' });
  return { get, service };
};

describe('createRenderFormBootstrapService', () => {
  it('loads an existing form even when it has no translations', async () => {
    const { get, service } = setup();
    get.mockResolvedValueOnce(form).mockResolvedValueOnce({});

    await expect(service.load(form.path)).resolves.toEqual({
      form: { ...form, firstPanelSlug: 'first-page' },
      translations: {},
    });
    expect(get).toHaveBeenNthCalledWith(1, expect.stringContaining('/fyllut/api/forms/test-form?select='));
    expect(get).toHaveBeenNthCalledWith(2, '/fyllut/api/forms/test-form/translations');
  });

  it('returns a missing form only when the form request returns NOT_FOUND', async () => {
    const { get, service } = setup();
    get.mockRejectedValueOnce(new ResponseError('NOT_FOUND', 'Form not found'));

    await expect(service.load(form.path)).resolves.toBeUndefined();
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([
    new ResponseError('SERVICE_UNAVAILABLE', 'Service unavailable'),
    new ResponseError('UNAUTHORIZED', 'Authentication required'),
    new TypeError('Failed to fetch'),
  ])('propagates form loading failures: %s', async (error) => {
    const { get, service } = setup();
    get.mockRejectedValueOnce(error);

    await expect(service.load(form.path)).rejects.toBe(error);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, null])('rejects an empty successful form response: %s', async (response) => {
    const { get, service } = setup();
    get.mockResolvedValueOnce(response);

    await expect(service.load(form.path)).rejects.toThrow('Form response is missing.');
    expect(get).toHaveBeenCalledTimes(1);
  });

  it.each([
    new ResponseError('NOT_FOUND', 'Translations not found'),
    new ResponseError('INTERNAL_SERVER_ERROR', 'Translation service failed'),
  ])('does not report an existing form as missing when translations fail: %s', async (error) => {
    const { get, service } = setup();
    get.mockResolvedValueOnce(form).mockRejectedValueOnce(error);

    await expect(service.load(form.path)).rejects.toBe(error);
  });

  it('rejects an empty translation response rather than treating the form as missing', async () => {
    const { get, service } = setup();
    get.mockResolvedValueOnce(form).mockResolvedValueOnce(undefined);

    await expect(service.load(form.path)).rejects.toThrow('Form translations response is missing.');
  });
});
