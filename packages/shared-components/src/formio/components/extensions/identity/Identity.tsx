import NavIdentity, { IdentityInput } from '../../../../components/indentity/Identity';
import { validateNationalIdentityNumber } from '../../../../components/indentity/NationalIdentityNumberValidator';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import identityBuilder from './Identity.builder';
import identityForm from './Identity.form';

export default class Identity extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Identifikasjon',
      type: 'identity',
      key: 'identifikasjon',
      fieldSize: 'input--s',
      spellcheck: false,
      hideLabel: true,
    });
  }

  static editForm() {
    return identityForm();
  }

  static get builderInfo() {
    return identityBuilder();
  }

  get defaultSchema() {
    return Identity.schema();
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    if (this.shouldSkipValidation(data, dirty, row)) {
      return true;
    }

    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const appConfig = this.options?.appConfig?.config;
      const errorMessage = validateNationalIdentityNumber(
        {
          value: this.getValue()?.identifikasjonsnummer,
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

  handleChange(value: IdentityInput) {
    super.handleChange(value);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <ComponentLabel
          component={this.component}
          editFields={this.getEditFields()}
          labelIsHidden={this.labelIsHidden()}
        />
        <NavIdentity
          onChange={this.handleChange.bind(this)}
          nationalIdentity={this.getValue()}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          required={this.isRequired()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
