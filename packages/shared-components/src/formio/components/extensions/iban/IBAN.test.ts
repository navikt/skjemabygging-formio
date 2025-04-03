import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { validateIBAN, ValidationErrorsIBAN } from 'ibantools';
import { Mock } from 'vitest';
import TextField from '../../core/textfield/TextField';
import IBAN from './IBAN';

const { wrongBBANLength, noIBANCountry, invalidIBAN } = TEXTS.validering;

vi.mock('ibantools', async () => {
  const actual = await vi.importActual('ibantools');
  return {
    ...actual,
    validateIBAN: vi.fn().mockReturnValue({ valid: true, errorCodes: [] }),
  };
});

const mockedSetComponentValidity = vi.fn();
describe('IBAN', () => {
  let ibanComp;

  const defaultError = {
    level: 'error',
    path: 'iban',
    elementId: undefined,
  };

  const mockedTranslate = (text: string, params?: Record<string, any>) => {
    text = TEXTS.validering[text] ? TEXTS.validering[text] : text;
    if (params) return text.replace(/{{2}([^{}]*field)}{2}/, params.field);
    else return text;
  };

  beforeEach(() => {
    ibanComp = new IBAN(undefined, {}, {});
    ibanComp.component.label = 'Label for IBAN';
    ibanComp.path = 'iban';
    ibanComp.setValue('IBAN-value');
    vi.spyOn(IBAN.prototype, 'translate').mockImplementation(mockedTranslate as any);
    vi.spyOn(IBAN.prototype, 'setComponentValidity').mockImplementation(mockedSetComponentValidity as any);
    vi.spyOn(TextField.prototype, 'checkComponentValidity').mockReturnValue(true);
  });

  afterEach(() => {
    mockedSetComponentValidity.mockClear();
  });

  describe('validateIban', () => {
    it('successfully validates valid IBAN', () => {
      ibanComp.checkComponentValidity();
      console.log(mockedSetComponentValidity.mock.calls[0][0]);
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('successfully validates empty IBAN', () => {
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANProvided] });
      ibanComp.setValue('');
      ibanComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('ignores empty value', () => {
      ibanComp.setValue('');
      ibanComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([]);
    });

    it('successfully validates when BBAN part of IBAN has the wrong length', () => {
      const expected = {
        ...defaultError,
        message: wrongBBANLength,
      };
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.WrongBBANLength] });
      ibanComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expected]);
    });

    it('successfully validates when no country code is provided', () => {
      const expected = {
        ...defaultError,
        message: noIBANCountry,
      };
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANCountry] });
      ibanComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expected]);
    });

    it('successfully validates when the IBAN is incorrect for other reasons', () => {
      const expected = {
        ...defaultError,
        message: invalidIBAN,
      };
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [99] });
      ibanComp.checkComponentValidity();
      expect(mockedSetComponentValidity.mock.calls[0][0]).toEqual([expected]);
    });
  });
});
