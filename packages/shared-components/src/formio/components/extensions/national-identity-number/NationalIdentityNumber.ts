import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import nationalIdentityNumberBuilder from './NationalIdentityNumber.builder';
import nationalIdentityNumberForm from './NationalIdentityNumber.form';
import { validateNationalIdentityNumber } from './NationalIdentityNumberValidator';

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

  checkComponentValidity(data, dirty, row, options = {}) {
    if (this.shouldSkipValidation(data, dirty, row)) {
      this.setCustomValidity('');
      return true;
    }

    const appConfig = this.options?.appConfig?.config;
    const errorMessage = validateNationalIdentityNumber(
      {
        value: this.getValue(),
        label: this.getLabel({ labelTextOnly: true }),
        required: this.isRequired(),
        allowTestTypes: appConfig?.NAIS_CLUSTER_NAME !== 'prod-gcp',
      },
      this.translate.bind(this),
    );
    return this.setComponentValidity(errorMessage ? [this.createError(errorMessage, undefined)] : [], dirty, undefined);
  }

  validateFnrNew(_inputValue) {
    return true;
  }
}
