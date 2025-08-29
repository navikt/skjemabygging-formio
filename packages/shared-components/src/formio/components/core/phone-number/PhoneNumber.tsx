import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavPhoneNumber from '../../../../components/phone-number/PhoneNumber';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import phoneNumberBuilder from './PhoneNumber.builder';
import phoneNumberForm from './PhoneNumber.form';

export type PhoneNumberObject = {
  areaCode: string;
  number: string;
};

export default class PhoneNumber extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Telefonnummer',
      type: 'phoneNumber',
      key: 'telefonNummer',
    });
  }

  static editForm() {
    return phoneNumberForm();
  }

  static get builderInfo() {
    return phoneNumberBuilder();
  }

  handleChange(value: string | PhoneNumberObject) {
    super.handleChange(value);
  }

  getShowAreaCode() {
    return this.component?.showAreaCode || false;
  }

  checkComponentValidity(data, dirty, row) {
    const errors: any = [];
    if (this.shouldSkipValidation(data, dirty, row) || this.getReadOnly()) {
      return true;
    }

    const errorMessage = this.validateTextfield();
    if (errorMessage) {
      errors.push(this.createError(errorMessage, 'phoneNumber'));
    }
    return this.setComponentValidity(errors, dirty, undefined);
  }

  private validateTextfield(): string | undefined {
    const value = this.getValue();
    const isPhoneNumberObject = typeof value === 'object';
    const phoneNumber = isPhoneNumberObject ? value?.number : value;

    if (!value || !phoneNumber) {
      return this.translateWithLabel(TEXTS.validering.required);
    }

    const areaCode = isPhoneNumberObject && value.areaCode;
    const isNorwegianNumber = areaCode === '+47';
    const containsDigitsOnly = RegExp(/^\d+$/).test(phoneNumber);
    const validNumber = /^[\d\-()+\s]+$/.test(phoneNumber) && !/[a-zA-Z]/.test(phoneNumber);
    if ((isNorwegianNumber && !containsDigitsOnly) || (!this.getShowAreaCode() && !validNumber)) {
      return this.translateWithLabel(TEXTS.validering.digitsOnly);
    }

    if (this.getShowAreaCode() && areaCode === '+47' && phoneNumber.length !== 8) {
      return this.translateWithLabel(TEXTS.validering.phoneNumberLength);
    }
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <ComponentLabel
          component={this.component}
          editFields={this.getEditFields()}
          labelIsHidden={this.labelIsHidden()}
        />
        <NavPhoneNumber
          label={this.getLabel()}
          onChange={this.handleChange.bind(this)}
          readOnly={this.getReadOnly()}
          className={this.getClassName()}
          fieldSize={this.getFieldSize()}
          required={this.isRequired()}
          customLabels={this.getCustomLabels()}
          showAreaCode={this.getShowAreaCode()}
          value={this.getValue() as PhoneNumberObject | string}
          error={this.getError()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
