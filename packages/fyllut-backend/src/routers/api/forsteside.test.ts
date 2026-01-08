import { ForstesideRequestBody } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';
import forsteside, { validateForstesideRequest } from './forsteside';

const { skjemabyggingProxyUrl } = config;

describe('[endpoint] forsteside', () => {
  it('Create front page', async () => {
    const generateFileMock = nock(skjemabyggingProxyUrl!).post('/foersteside').reply(200, '{}');

    const req = mockRequest({
      headers: {
        AzureAccessToken: '',
      },
      body: {
        foerstesidetype: 'ETTERSENDELSE',
        navSkjemaId: 'NAV 10.10.10',
        spraakkode: 'NB',
        overskriftstittel: 'Tittel',
        arkivtittel: 'Tittel',
        tema: 'HJE',
      },
    });

    await forsteside.post(req, mockResponse(), mockNext());

    expect(generateFileMock.isDone()).toBe(true);
  });

  describe('validateForstesideRequest', () => {
    it('If theme is set not on existing address, use default netsPostboks', async () => {
      const body = await validateForstesideRequest({
        tema: 'HJR',
      } as ForstesideRequestBody);

      expect(body.netsPostboks).toBeDefined();
      expect(body.adresse).toBeUndefined();
    });

    it('Set default netsPostboks if not set', async () => {
      const body = await validateForstesideRequest({} as ForstesideRequestBody);

      expect(body.netsPostboks).toBe('1400');
    });

    it('Do not overide netsPostboks if set', async () => {
      const body = await validateForstesideRequest({
        netsPostboks: '1300',
      } as ForstesideRequestBody);

      expect(body.netsPostboks).toBe('1300');
    });

    it('Change nb-NO', async () => {
      const body = await validateForstesideRequest({
        spraakkode: 'nb-NO',
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe('NB');
    });

    it('Change nb-NN', async () => {
      const body = await validateForstesideRequest({
        spraakkode: 'nn-NO',
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe('NN');
    });

    it('Change nn to uppercase', async () => {
      const body = await validateForstesideRequest({
        spraakkode: 'nn',
      } as ForstesideRequestBody);

      expect(body.spraakkode).toBe('NN');
    });
  });
});
