import { ForstesideRequestBody, forstesideUtils } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';
import forsteside from './forsteside';
import * as mottaksadresser from './mottaksadresser';

const { skjemabyggingProxyUrl, formsApiUrl } = config;

const addresses = [
  {
    _id: '6246de1afd03d2caeeda2825',
    data: {
      adresselinje1: 'NAV Arbeid og ytelser lønnsgaranti',
      adresselinje2: 'Postboks 6683 St. Olavs Plass',
      adresselinje3: '',
      postnummer: '0129',
      poststed: 'Oslo',
      temakoder: 'FOS,HJE',
    },
  },
  {
    _id: '61c09f91ec962a0003c65014',
    data: {
      adresselinje1: 'NAV Skanning bidrag',
      adresselinje2: 'PB 6215 Etterstad',
      adresselinje3: '',
      postnummer: '0603',
      poststed: 'Oslo',
    },
  },
];

describe('[endpoint] forsteside', () => {
  beforeAll(() => {
    vi.spyOn(mottaksadresser, 'loadMottaksadresser').mockImplementation(async () => addresses);
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
        submission: '{}',
      },
    });

    await forsteside.post(req, mockResponse(), mockNext());

    expect(recipientsMock.isDone()).toBe(true);
    expect(generateFileMock.isDone()).toBe(true);
  });
});
