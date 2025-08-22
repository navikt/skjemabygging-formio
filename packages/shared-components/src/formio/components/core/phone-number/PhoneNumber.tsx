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

  checkComponentValidity(data, dirty, row, options = {}) {
    if (this.getReadOnly()) {
      return true;
    }

    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const errorMessage = this.validateTextfield();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }
    return validity;
  }

  private validateTextfield(): string | undefined {
    const value = this.getValue();

    if (value === '' || value === undefined) {
      return;
    }

    const isPhoneNumberObject = typeof value === 'object' && value !== null && 'areaCode' in value && 'number' in value;
    const phoneNumber = isPhoneNumberObject ? value.number : value;
    const areCode = isPhoneNumberObject && value.areaCode;
    const containsDigitsOnly = RegExp(/^\d+$/).test(phoneNumber);
    if (!containsDigitsOnly) {
      return this.translateWithLabel(TEXTS.validering.digitsOnly);
    }
    if (this.getShowAreaCode() && areCode === '+47' && phoneNumber.length !== 8) {
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
