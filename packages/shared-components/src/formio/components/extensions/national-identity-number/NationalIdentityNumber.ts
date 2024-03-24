import { idnr } from '@navikt/fnrvalidator';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextFieldComponent from 'formiojs/components/textfield/TextField';
import nationalIdentityNumberBuilder from './NationalIdentityNumber.builder';
import nationalIdentityNumberForm from './NationalIdentityNumber.form';

const ALLOWED_TYPES = ['fnr', 'dnr'];

export default class NationalIdentityNumber extends TextFieldComponent {
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

    const inputValueNoSpace = inputValue.replace(' ', '');

    // @ts-ignore
    const { status, type } = idnr(inputValueNoSpace);
    if (!ALLOWED_TYPES.includes(type) || status !== 'valid') {
      //translate based on key in validering file.
      // @ts-ignore
      return this.t('fodselsnummerDNummer') === 'fodselsnummerDNummer'
        ? TEXTS.validering.fodselsnummerDNummer
        : // @ts-ignore
          this.t('fodselsnummerDNummer');
    }
    return true;
  }
}
