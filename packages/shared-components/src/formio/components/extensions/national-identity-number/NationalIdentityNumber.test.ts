import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NationalIdenityNumber from './NationalIdentityNumber.js';

const VALID_HNR = '13527248013';
const VALID_TNR = '10915596784';

describe('Fodselsnummer', () => {
  describe('validering', () => {
    let fnrComp;

    beforeEach(() => {
      fnrComp = new NationalIdenityNumber();
      fnrComp.options = {
        appConfig: { config: { NAIS_CLUSTER_NAME: 'prod-gcp' } },
      };
      vi.spyOn(NationalIdenityNumber.prototype, 't').mockImplementation((text) => text);
    });

    it('successfully validates a fnr', () => {
      expect(fnrComp.validateFnrNew('13097248022')).toBe(true);
    });

    it('successfully validates empty fnr', () => {
      expect(fnrComp.validateFnrNew('')).toBe(true);
    });

    it('fails validation for invalid fnr', () => {
      expect(fnrComp.validateFnrNew('13097248023')).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it('successfully validates a fnr containing space', () => {
      expect(fnrComp.validateFnrNew('130972 48022')).toBe(true);
    });

    it('successfully validates a dnr', () => {
      expect(fnrComp.validateFnrNew('53097248016')).toBe(true);
    });

    it('fails validation for 12345678911', () => {
      expect(fnrComp.validateFnrNew('12345678911')).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it('fails validation for 00000000000', () => {
      expect(fnrComp.validateFnrNew('00000000000')).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it('fails validation for hnr', () => {
      expect(fnrComp.validateFnrNew(VALID_HNR)).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it('fails validation for tnr', () => {
      expect(fnrComp.validateFnrNew(VALID_TNR)).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it('succeeds validation for tnr if env is delingslenke', () => {
      fnrComp.options = {
        appConfig: { config: { isDelingslenke: true, NAIS_CLUSTER_NAME: 'dev-gcp' } },
      };
      expect(fnrComp.validateFnrNew(VALID_TNR)).toBe(true);
    });

    it('succeeds validation for tnr if env is development', () => {
      fnrComp.options = {
        appConfig: { config: { isDevelopment: true, NAIS_CLUSTER_NAME: 'dev-gcp' } },
      };
      expect(fnrComp.validateFnrNew(VALID_TNR)).toBe(true);
    });
  });
});
