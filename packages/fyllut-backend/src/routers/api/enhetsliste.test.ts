import { Enhet, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { Response } from 'express';
import nock from 'nock';
import { Mock } from 'vitest';
import { config } from '../../config/config';
import { mockNext } from '../../test/requestTestHelpers';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import enhetslisteEndpoint from './enhetsliste';
import enheter from './testdata/enheter';

const { norg2 } = config;

const getEnhetslisteFromResponse = (res: Response): Enhet[] => (res.json as Mock).mock.calls[0][0];

describe('[endpoint] enhetsliste', () => {
  let fetchEnhetslisteMock: nock.Scope;

  afterEach(() => {
    if (fetchEnhetslisteMock) {
      fetchEnhetslisteMock.done();
    }
  });

  describe('When proxy returns complete list containg all enheter', () => {
    beforeEach(() => {
      fetchEnhetslisteMock = nock(norg2.url)
        .get('/norg2/api/v1/enhet?enhetStatusListe=AKTIV')
        .reply(200, JSON.stringify(enheter));
    });

    it('filters enheter with unsupported type', async () => {
      const req = mockRequest({
        headers: {
          AzureAccessToken: '',
        },
      });
      const res = mockResponse();
      await enhetslisteEndpoint.get(req, res, mockNext());
      expect(res.json).toHaveBeenCalled();

      const enhetsliste = getEnhetslisteFromResponse(res);
      expect(enhetsliste.length).toBeGreaterThan(0);
      enhetsliste.forEach((enhet: Enhet) => {
        expect(supportedEnhetstyper.includes(enhet.type)).toBe(true);
        expect(enhet.enhetNr).not.toBe('0000');
      });
    });

    it('only returns relevant data', async () => {
      const req = mockRequest({
        headers: {
          AzureAccessToken: '',
        },
      });
      const res = mockResponse();
      await enhetslisteEndpoint.get(req, res, mockNext());
      expect(res.json).toHaveBeenCalled();

      const enhetsliste = getEnhetslisteFromResponse(res);
      expect(enhetsliste.length).toBeGreaterThan(0);
      enhetsliste.forEach((enhet: Enhet) => {
        expect(Object.keys(enhet)).toEqual(['enhetId', 'navn', 'enhetNr', 'type']);
      });
    });
  });

  describe('When proxy returns status 500', () => {
    beforeEach(() => {
      fetchEnhetslisteMock = nock(norg2.url)
        .get('/norg2/api/v1/enhet?enhetStatusListe=AKTIV')
        .reply(500, JSON.stringify({ correlationId: '1234' }));
    });

    it('invokes next function with error', async () => {
      const req = mockRequest({
        headers: {
          AzureAccessToken: '',
        },
      });
      const res = mockResponse();
      const next = mockNext();
      await enhetslisteEndpoint.get(req, res, next);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = (next as Mock).mock.calls[0][0];
      expect(error.message).toBe('Feil ved henting av enhetsliste');
      expect(error.functional).toBe(true);
    });
  });

  describe('Testdata', () => {
    it('includes enheter which is not supported', () => {
      expect(enheter.some((enhet) => !supportedEnhetstyper.includes(enhet.type))).toBe(true);
    });

    it("includes enhet with enhetNr '0000'", () => {
      expect(enheter.some((enhet) => enhet.enhetNr === '0000')).toBe(true);
    });
  });
});
