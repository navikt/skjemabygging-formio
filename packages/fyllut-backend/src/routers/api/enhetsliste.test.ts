import { Enhet, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { Response } from 'express';
import { Mock } from 'vitest';
import { navUnitService } from '../../services';
import { mockRequest, mockResponse } from '../../test/testHelpers';
import enhetslisteEndpoint from './enhetsliste';
import enheter from './testdata/enheter';

vi.mock('../../services', () => ({
  navUnitService: {
    getNavUnits: vi.fn(),
  },
}));

const getEnhetslisteFromResponse = (res: Response): Enhet[] => (res.json as Mock).mock.calls[0][0];

describe('[endpoint] enhetsliste', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('When proxy returns complete list containg all enheter', () => {
    beforeEach(() => {
      vi.mocked(navUnitService.getNavUnits).mockResolvedValue(enheter);
    });

    it('filters enheter with unsupported type', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      await enhetslisteEndpoint.get(req, res);
      expect(res.json).toHaveBeenCalled();

      const enhetsliste = getEnhetslisteFromResponse(res);
      expect(enhetsliste.length).toBeGreaterThan(0);
      enhetsliste.forEach((enhet: Enhet) => {
        expect(supportedEnhetstyper.includes(enhet.type)).toBe(true);
        expect(enhet.enhetNr).not.toBe('0000');
      });
    });

    it('only returns relevant data', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      await enhetslisteEndpoint.get(req, res);
      expect(res.json).toHaveBeenCalled();

      const enhetsliste = getEnhetslisteFromResponse(res);
      expect(enhetsliste.length).toBeGreaterThan(0);
      enhetsliste.forEach((enhet: Enhet) => {
        expect(Object.keys(enhet)).toEqual(['enhetId', 'navn', 'enhetNr', 'type']);
      });
    });
  });

  describe('When proxy returns status 500', () => {
    it('throws the service error', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      const error = new Error('upstream failed');
      vi.mocked(navUnitService.getNavUnits).mockRejectedValueOnce(error);

      await expect(enhetslisteEndpoint.get(req, res)).rejects.toBe(error);
      expect(res.json).not.toHaveBeenCalled();
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
