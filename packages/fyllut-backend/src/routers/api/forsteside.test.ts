import { ForstesideRequestBody } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';
import forsteside, { validateForstesideRequest } from './forsteside';

const { skjemabyggingProxyUrl } = config;

describe('[endpoint] forsteside', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create front page', async () => {
    const generateFileMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('{}'));

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

    expect(generateFileMock).toHaveBeenCalledExactlyOnceWith(
      `${skjemabyggingProxyUrl}/foersteside`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects invalid unknown user information before calling the proxy', async () => {
    const generateFileMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('{}'));
    const next = mockNext();
    const req = mockRequest({
      headers: {
        AzureAccessToken: '',
      },
      body: {
        foerstesidetype: 'ETTERSENDELSE',
        ukjentBrukerPersoninfo: 'Test\\',
      },
    });

    await forsteside.post(req, mockResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'BAD_REQUEST',
        message: 'Unknown user information contains invalid characters.',
      }),
    );
    expect(generateFileMock).not.toHaveBeenCalled();
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
