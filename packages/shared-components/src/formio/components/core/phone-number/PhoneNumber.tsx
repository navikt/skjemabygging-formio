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
  constructor(...args: any[]) {
    // @ts-expect-error args
    super(...args);
    this.noMainRef();
  }

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
    this.removeAllErrors();

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
    if (!this.isRequired() && !value) return undefined;

    const isObject = typeof value === 'object' && value !== null;
    const phoneNumber = isObject ? value.number : value;
    const areaCode = isObject ? value.areaCode : undefined;

    if (!phoneNumber) {
      return this.translateWithLabel(TEXTS.validering.required);
    }

    const DIGITS_ONLY = /^\d+$/;
    const VALID_NUMBER = /^[\d\-()+\s]+$/;

    if (areaCode === '+47') {
      if (!DIGITS_ONLY.test(phoneNumber)) {
        return this.translateWithLabel(TEXTS.validering.digitsOnly);
      }
      if (this.getShowAreaCode() && phoneNumber.length !== 8) {
        return this.translateWithLabel(TEXTS.validering.phoneNumberLength);
      }
    } else if (!this.getShowAreaCode() && (!VALID_NUMBER.test(phoneNumber) || /[a-zA-Z]/.test(phoneNumber))) {
      return this.translateWithLabel(TEXTS.validering.digitsOnly);
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
