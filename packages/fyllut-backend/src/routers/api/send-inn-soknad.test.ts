import nock from 'nock';
import { config } from '../../config/config';
import { mockRequest, MockRequestParams, mockResponse } from '../../test/testHelpers';
import { EnvQualifier, EnvQualifierType } from '../../types/env';
import sendInnSoknad from './send-inn-soknad';
import {
  decodedResponseBody,
  innsendingsId,
  mockFormData,
  requestBody,
  sendInnResponseBody,
} from './testdata/mellomlagring';

const { formsApiUrl, sendInnConfig } = config;

type MockSendInnRequestParams = MockRequestParams & { envQualifier?: EnvQualifierType };
const mockRequestWithSendInnData = ({ headers = {}, body, params = {}, envQualifier }: MockSendInnRequestParams) => {
  const req = mockRequest({ headers, body, params });
  req.getIdportenPid = () => '12345678911';
  req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
  req.getEnvQualifier = () => envQualifier;
  return req;
};

describe('[endpoint] send-inn/soknad', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  const requestBodyWithInnsendingsId = { ...requestBody, innsendingsId };

  describe('GET', () => {
    it('returns with data in response body if success', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, sendInnResponseBody);
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.get(req, res, next);

      expect(res.json).toHaveBeenCalledWith(decodedResponseBody);
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('returns with 404 if innsendingsId is invalid', async () => {
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
        params: { innsendingsId: '1234-fake-innsendingsId' },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.get(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    it('calls next if SendInn returns error', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, 'error body');
      const req = mockRequestWithSendInnData({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.get(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal Server Error');
      expect(error.userMessage).toBeUndefined();
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with not found if SendInn returns status 404', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .get(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(404, 'error body');
      const req = mockRequestWithSendInnData({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.get(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Not Found');
      expect(res.json).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with error if tokenx access token is missing', async () => {
      const req = mockRequest({ body: requestBody, params: { innsendingsId } });
      req.getIdportenPid = () => '12345678911';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.get(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing TokenX access token');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    it('returns response body if success', async () => {
      const formScope = nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host)
        .post(sendInnConfig.paths.soknad)
        .reply(201, sendInnResponseBody);
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.post(req, res, next);

      expect(res.json).toHaveBeenCalledWith(sendInnResponseBody);
      expect(next).not.toHaveBeenCalled();
      expect(formScope.isDone()).toBe(true);
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('includes header Nav-Env-Qualifier if specified', async () => {
      const formScope = nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host)
        .post(sendInnConfig.paths.soknad)
        .matchHeader('Nav-Env-Qualifier', EnvQualifier.preprodAltAnsatt)
        .reply(201, sendInnResponseBody);
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
        envQualifier: EnvQualifier.preprodAltAnsatt,
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.post(req, res, next);

      expect(formScope.isDone()).toBe(true);
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
      expect(res.json).toHaveBeenCalledWith(sendInnResponseBody);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next if SendInn returns error', async () => {
      nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host).post(sendInnConfig.paths.soknad).reply(500, 'error body');
      const req = mockRequestWithSendInnData({ body: requestBody });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal Server Error');
      expect(error.userMessage).toBeUndefined();
      expect(res.json).not.toHaveBeenCalled();
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with not found if SendInn returns status 404', async () => {
      nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(404, 'error body');
      const req = mockRequestWithSendInnData({ body: requestBodyWithInnsendingsId });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Not Found');
      expect(res.json).not.toHaveBeenCalled();
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with error if idporten pid is missing', async () => {
      const req = mockRequest({ body: requestBody });
      req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing idporten pid');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });

    it('calls next with error if tokenx access token is missing', async () => {
      const req = mockRequest({ body: requestBody });
      req.getIdportenPid = () => '12345678911';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.post(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing TokenX access token');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('returns response body if success', async () => {
      nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, requestBodyWithInnsendingsId);
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBodyWithInnsendingsId,
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.put(req, res, next);

      expect(res.json).toHaveBeenCalledWith(requestBodyWithInnsendingsId);
      expect(next).not.toHaveBeenCalled();
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next if SendInn returns error', async () => {
      nock(formsApiUrl).get('/v1/forms/nav999999').query(true).reply(200, mockFormData);
      const globalTranslationsScope = nock(formsApiUrl).get('/v1/global-translations').reply(200, []);
      const formTranslationsScope = nock(formsApiUrl).get('/v1/forms/nav999999/translations').reply(200, []);
      const sendInnNockScope = nock(sendInnConfig.host)
        .put(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, 'error body');
      const req = mockRequestWithSendInnData({ body: requestBodyWithInnsendingsId });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal Server Error');
      expect(error.userMessage).toBeUndefined();
      expect(res.json).not.toHaveBeenCalled();
      expect(globalTranslationsScope.isDone()).toBe(true);
      expect(formTranslationsScope.isDone()).toBe(true);
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with error if idporten pid is missing', async () => {
      const req = mockRequest({ body: requestBodyWithInnsendingsId });
      req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing idporten pid');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });

    it('calls next with error if tokenx access token is missing', async () => {
      const req = mockRequest({ body: requestBodyWithInnsendingsId });
      req.getIdportenPid = () => '12345678911';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.put(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing TokenX access token');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('returns with confirmation in response body if success', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .delete(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(200, { status: 'OK' });
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
      expect(next).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('returns with error if innsendingsId is invalid', async () => {
      const req = mockRequestWithSendInnData({
        headers: { AzureAccessToken: 'azure-access-token' },
        body: requestBody,
        params: { innsendingsId: '1234-fake-innsendingsId' },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.delete(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.message).toBe(
        '1234-fake-innsendingsId er ikke en gyldig innsendingsId. Kan ikke slette mellomlagret søknad.',
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it('calls next if SendInn returns error', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .delete(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(500, 'error body');
      const req = mockRequestWithSendInnData({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(error.message).toBe('Internal Server Error');
      expect(error.userMessage).toBeUndefined();
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with not found if SendInn returns status 404', async () => {
      const sendInnNockScope = nock(sendInnConfig.host)
        .delete(`${sendInnConfig.paths.soknad}/${innsendingsId}`)
        .reply(404, 'error body');
      const req = mockRequestWithSendInnData({
        body: requestBody,
        params: { innsendingsId },
      });
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toBe('Not Found');
      expect(res.json).not.toHaveBeenCalled();
      expect(sendInnNockScope.isDone()).toBe(true);
    });

    it('calls next with error if tokenx access token is missing', async () => {
      const req = mockRequest({ body: requestBody, params: { innsendingsId } });
      req.getIdportenPid = () => '12345678911';
      const res = mockResponse();
      const next = vi.fn();
      await sendInnSoknad.delete(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error: any = next.mock.calls[0][0];
      expect(error.functional).toBeFalsy();
      expect(error.message).toBe('Missing TokenX access token');
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.header).not.toHaveBeenCalled();
    });
  });
});
