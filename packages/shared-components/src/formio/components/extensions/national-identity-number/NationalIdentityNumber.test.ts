import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from '../../core/textfield/TextField';
import NationalIdenityNumber from './NationalIdentityNumber';

const VALID_HNR = '13527248013';
const VALID_TNR = '10915596784';

const mockedSetComponentValidity = vi.fn();
describe('Fodselsnummer', () => {
  let fnrComp;

  const mockedTranslate = (text: string, params?: Record<string, any>) => {
    text = TEXTS.validering[text] ? TEXTS.validering[text] : text;
    if (params) return text.replace(/{{2}([^{}]*field)}{2}/, params.field);
    else return text;
  };

  beforeEach(() => {
    fnrComp = new NationalIdenityNumber(
      undefined,
      {
        appConfig: { config: { NAIS_CLUSTER_NAME: 'prod-gcp' } },
      },
      {},
    );
    fnrComp.path = 'fodselsnummerDNummer';
    fnrComp.component.label = 'Label for Fnr';
    vi.spyOn(NationalIdenityNumber.prototype, 'translate').mockImplementation(mockedTranslate as any);
    vi.spyOn(NationalIdenityNumber.prototype, 'setComponentValidity').mockImplementation(
      mockedSetComponentValidity as any,
    );
    vi.spyOn(TextField.prototype, 'checkComponentValidity').mockReturnValue(true);
  });

  afterEach(() => {
    mockedSetComponentValidity.mockClear();
  });

  describe('validering', () => {
    const expectedInvalid = {
      message: 'Dette er ikke et gyldig fødselsnummer eller d-nummer (11 siffer)',
      level: 'error',
      path: 'fodselsnummerDNummer',
      elementId: undefined,
    };

    it('successfully validates a fnr', () => {
      fnrComp.setValue('13097248022');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('ignores empty values', () => {
      fnrComp.setValue('');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('fails validation for invalid fnr', () => {
      fnrComp.setValue('13097248023');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expectedInvalid]);
    });

    it('successfully validates a fnr containing space', () => {
      fnrComp.setValue('130972 48022');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('successfully validates a dnr', () => {
      fnrComp.setValue('53097248016');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('fails validation for 12345678911', () => {
      fnrComp.setValue('12345678911');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expectedInvalid]);
    });

    it('fails validation for 00000000000', () => {
      fnrComp.setValue('00000000000');
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expectedInvalid]);
    });

    it('fails validation for hnr', () => {
      fnrComp.setValue(VALID_HNR);
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expectedInvalid]);
    });

    it('fails validation for tnr', () => {
      fnrComp.setValue(VALID_TNR);
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expectedInvalid]);
    });

    it('succeeds validation for tnr if env is delingslenke', () => {
      fnrComp.options = {
        appConfig: { config: { isDelingslenke: true, NAIS_CLUSTER_NAME: 'dev-gcp' } },
      };
      fnrComp.setValue(VALID_TNR);
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('succeeds validation for tnr if env is development', () => {
      fnrComp.options = {
        appConfig: { config: { isDevelopment: true, NAIS_CLUSTER_NAME: 'dev-gcp' } },
      };
      fnrComp.setValue(VALID_TNR);
      fnrComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });
  });
});
