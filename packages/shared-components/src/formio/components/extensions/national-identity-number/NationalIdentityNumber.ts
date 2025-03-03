import { validateNationalIdentityNumber } from '../../../../components/identity/NationalIdentityNumberValidator';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import nationalIdentityNumberBuilder from './NationalIdentityNumber.builder';
import nationalIdentityNumberForm from './NationalIdentityNumber.form';

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
    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const appConfig = this.options?.appConfig?.config;
      const errorMessage = validateNationalIdentityNumber(
        {
          value: this.getValue(),
          allowTestTypes: appConfig?.NAIS_CLUSTER_NAME !== 'prod-gcp',
        },
        this.translate.bind(this),
      );
      return this.setComponentValidity(
        errorMessage ? [this.createError(errorMessage, undefined)] : [],
        dirty,
        undefined,
      );
    }
    return validity;
  }

  /**
   * @deprecated Validation has been moved. We keep this to support schemas that contains a reference to the function
   */
  validateFnrNew(_inputValue) {
    return true;
  }
}
