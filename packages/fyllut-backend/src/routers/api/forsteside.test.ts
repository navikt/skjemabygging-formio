import { ForstesideRequestBody } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../config/config';
import { mockNext, mockRequest, mockResponse } from '../../test/requestTestHelpers';
import forsteside, { validateForstesideRequest } from './forsteside';

const { skjemabyggingProxyUrl } = config;

const foerstesideBody = {
  foerstesidetype: 'ETTERSENDELSE',
  navSkjemaId: 'NAV 10.10.10',
  spraakkode: 'NB',
  overskriftstittel: 'Tittel',
  arkivtittel: 'Tittel',
  tema: 'HJE',
};

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
      body: { ...foerstesideBody },
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

  it('forwards BAD_REQUEST ResponseError when the proxy rejects the request with HTTP 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Validering av ident feilet. brukerId=110550, brukerType=PERSON.', { status: 400 }),
    );
    const next = vi.fn();
    const req = mockRequest({
      headers: { AzureAccessToken: '' },
      body: { ...foerstesideBody },
    });

    await forsteside.post(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    const forwardedError = next.mock.calls[0][0];
    expect(forwardedError).toBeInstanceOf(ResponseError);
    expect(forwardedError).toMatchObject({
      errorCode: 'BAD_REQUEST',
      message: 'Feil ved generering av førsteside',
      userMessage: 'Feil ved generering av førsteside',
    });
  });

  it.each([500, 503])(
    'forwards INTERNAL_SERVER_ERROR ResponseError when the proxy responds with HTTP %i',
    async (status) => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Upstream error', { status }));
      const next = vi.fn();
      const req = mockRequest({
        headers: { AzureAccessToken: '' },
        body: { ...foerstesideBody },
      });

      await forsteside.post(req, mockResponse(), next);

      expect(next).toHaveBeenCalledOnce();
      const forwardedError = next.mock.calls[0][0];
      expect(forwardedError).toBeInstanceOf(ResponseError);
      expect(forwardedError).toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Feil ved generering av førsteside',
        userMessage: 'Feil ved generering av førsteside',
      });
    },
  );

  it('forwards network failures from the proxy call to next', async () => {
    const networkError = new TypeError('fetch failed');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(networkError);
    const next = mockNext();
    const req = mockRequest({
      headers: { AzureAccessToken: '' },
      body: { ...foerstesideBody },
    });

    await forsteside.post(req, mockResponse(), next);

    expect(next).toHaveBeenCalledExactlyOnceWith(networkError);
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
