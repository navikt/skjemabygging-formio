import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavIdentity, { IdentityInput, IdentityInputType } from '../../../../components/indentity/Identity';
import { validateNationalIdentityNumber } from '../../../../components/indentity/NationalIdentityNumberValidator';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import identityBuilder from './Identity.builder';
import identityForm from './Identity.form';

export default class Identity extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Identitet',
      type: 'identity',
      key: 'identitet',
      fieldSize: 'input--s',
      spellcheck: false,
      hideLabel: true,
      validate: {
        required: true,
      },
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

  init() {
    super.init();
    this.initPrefill();
  }

  initPrefill() {
    if (this.isSubmissionDigital() && this.component?.prefillKey && this.component?.prefillValue) {
      // Call parent setValue so ignore prefillKey block on local setValue.
      super.setValue({
        identitetsnummer: this.component?.prefillValue,
      } as IdentityInput);
    }
  }

  getReadOnly(): boolean {
    return !!this.component?.prefillKey && this.isSubmissionDigital();
  }

  get errors() {
    return this.componentErrors;
  }

  checkValidity(data, dirty, row) {
    this.removeAllErrors();

    if (this.shouldSkipValidation(data, dirty, row) || this.getReadOnly()) {
      return true;
    }

    const identity: IdentityInput = this.getValue() ?? {};
    if (this.isRequired()) {
      if (identity.harDuFodselsnummer === true) {
        this.validateRequired(identity, 'identitetsnummer', TEXTS.statiske.identity.identityNumber);
      } else if (identity.harDuFodselsnummer === false) {
        this.validateRequired(identity, 'fodselsdato', TEXTS.statiske.identity.yourBirthdate);
      } else {
        this.validateRequired(identity, 'harDuFodselsnummer', TEXTS.statiske.identity.doYouHaveIdentityNumber);
      }
    }

    if (identity.identitetsnummer) {
      const appConfig = this.options?.appConfig?.config;
      const errorMessage = validateNationalIdentityNumber(
        {
          value: this.getValue()?.identitetsnummer,
          allowTestTypes: appConfig?.NAIS_CLUSTER_NAME !== 'prod-gcp',
        },
        this.translate.bind(this),
      );

      if (errorMessage) {
        this.addIdentityError(TEXTS.statiske.identity.identityNumber, 'identitetsnummer');
      }
    }

    this.rerender();

    return this.componentErrors.length === 0;
  }

  validateRequired(identity: IdentityInput, identityType: IdentityInputType, label: string) {
    if (!identity[identityType]) {
      this.addIdentityError(this.translate('required', { field: label }), identityType);
    }
  }

  addIdentityError(errorMessage: string, identityType: IdentityInputType) {
    const elementId = `identity:${identityType}`;
    super.addError(errorMessage, elementId);
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
          identity={this.getValue()}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          required={this.isRequired()}
        />
      </ComponentUtilsProvider>,
    );
  }
}