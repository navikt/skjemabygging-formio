import { ForstesideRequestBody, forstesideUtils } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';
import forstesideV2 from './forstesideV2';

const { skjemabyggingProxyUrl, formsApiUrl } = config;

describe('[endpoint] forsteside', () => {
  beforeAll(() => {
    vi.spyOn(forstesideUtils, 'genererFoerstesideData').mockImplementation(
      () =>
        ({
          foerstesidetype: 'ETTERSENDELSE',
          navSkjemaId: 'NAV 10.10.10',
          spraakkode: 'NB',
          overskriftstittel: 'Tittel',
          arkivtittel: 'Tittel',
          tema: 'HJE',
        }) as ForstesideRequestBody,
    );
  });

  it('Create front page', async () => {
    const recipientsMock = nock(formsApiUrl).get('/v1/recipients').reply(200, []);
    const generateFileMock = nock(skjemabyggingProxyUrl!).post('/foersteside').reply(200, '{}');

    const req = mockRequest({
      headers: {
        AzureAccessToken: '',
      },
      body: {
        form: JSON.stringify({ properties: { mottaksadresseId: 'mottaksadresseId' } }),
        submissionData: '{}',
      },
    });

    await forstesideV2.post(req, mockResponse(), mockNext());

    expect(recipientsMock.isDone()).toBe(true);
    expect(generateFileMock.isDone()).toBe(true);
  });
});
