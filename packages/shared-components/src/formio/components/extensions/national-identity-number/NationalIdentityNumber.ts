import { idnr } from '@navikt/fnrvalidator';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import nationalIdentityNumberBuilder from './NationalIdentityNumber.builder';
import nationalIdentityNumberForm from './NationalIdentityNumber.form';

const ALLOWED_TYPES = ['fnr', 'dnr'];
const ALLOWED_TEST_TYPES = ['fnr', 'dnr', 'hnr', 'tnr', 'dnr-and-hnr'];

export default class NationalIdentityNumber extends TextField {
  static schema() {
    return BaseComponent.schema({
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

    const appConfig = this.options?.appConfig?.config;

    const inputValueNoSpace = inputValue?.replace(' ', '');
    const result = idnr(inputValueNoSpace ?? '');

    const errorMessage: string =
      this.translate('fodselsnummerDNummer') === 'fodselsnummerDNummer'
        ? TEXTS.validering.fodselsnummerDNummer
        : this.translate('fodselsnummerDNummer');

    if (result.status === 'invalid') {
      return errorMessage;
    }

    if (result.status === 'valid') {
      // Allow only fnr and dnr in production
      if (ALLOWED_TYPES.includes(result.type)) {
        return true;
      }

      // Allow all types in test environments
      if (appConfig?.NAIS_CLUSTER_NAME !== 'prod-gcp') {
        return ALLOWED_TEST_TYPES.includes(result.type);
      }

      return errorMessage;
    }

    return true;
  }
}
