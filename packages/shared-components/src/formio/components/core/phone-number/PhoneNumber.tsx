import { formatPhoneNumber } from '@navikt/skjemadigitalisering-shared-domain';
import NavPhoneNumber from '../../../../components/phone-number/PhoneNumber';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import phoneNumberBuilder from './PhoneNumber.builder';
import phoneNumberForm from './PhoneNumber.form';

export type PhoneNumberObject = {
  areaCode?: string;
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
    return this.component?.showAreaCode;
  }

  onBlur(value: string) {
    super.setValueOnReactInstance(formatPhoneNumber(value, '+47'));
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
          onBlur={this.onBlur.bind(this)}
        />
      </ComponentUtilsProvider>,
    );
  }
}
