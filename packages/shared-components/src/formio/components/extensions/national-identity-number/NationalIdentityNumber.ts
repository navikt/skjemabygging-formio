import { idnr } from '@navikt/fnrvalidator';
import { ConfigType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextFieldComponent from 'formiojs/components/textfield/TextField';
import nationalIdentityNumberBuilder from './NationalIdentityNumber.builder';
import nationalIdentityNumberForm from './NationalIdentityNumber.form';

const ALLOWED_TYPES = ['fnr', 'dnr'];
const ALLOWED_TEST_TYPES = ['fnr', 'dnr', 'hnr', 'tnr', 'dnr-and-hnr'];

export default class NationalIdentityNumber extends TextFieldComponent {
  options: any;
  t: any;

  static schema() {
    return TextFieldComponent.schema({
      label: 'Fødselsnummer eller d-nummer',
      type: 'fnrfield',
      key: 'fodselsnummerDNummer',
      fieldSize: 'input--s',
      spellcheck: false,
    });
  }

  static editForm() {
    return nationalIdentityNumberForm();
  }

  static get builderInfo() {
    return nationalIdentityNumberBuilder();
  }

  get defaultSchema() {
    return NationalIdentityNumber.schema();
  }

  validateFnrNew(inputValue) {
    if (inputValue === '') {
      // Vi lar default required-validering ta hånd om tomt felt feilmelding
      return true;
    }

    const appConfig = this.options?.appConfig?.config as ConfigType;

    console.log('appConfig', appConfig);

    const inputValueNoSpace = inputValue.replace(' ', '');
    const result = idnr(inputValueNoSpace);

    const errorMessage: string =
      this.t('fodselsnummerDNummer') === 'fodselsnummerDNummer'
        ? TEXTS.validering.fodselsnummerDNummer
        : this.t('fodselsnummerDNummer');

    if (result.status === 'invalid') {
      return errorMessage;
    }

    if (result.status === 'valid') {
      if (ALLOWED_TYPES.includes(result.type)) {
        return true;
      } else if (!appConfig?.isProduction) {
        return ALLOWED_TEST_TYPES.includes(result.type);
      } else {
        return errorMessage;
      }
    }

    return true;
  }
}
