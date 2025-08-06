import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
import NavPhoneNumber from '../../../../components/phone-number/PhoneNumber';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import phoneNumberBuilder from './PhoneNumber.builder';
import phoneNumberForm from './PhoneNumber.form';

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

  getInputMode(): InputMode {
    return 'tel';
  }

  // onBlur(): FocusEventHandler<HTMLInputElement> {
  //   return (event: React.FocusEvent<HTMLInputElement>) => {
  //     const value = removeAllSpaces(event.currentTarget.value);
  //     if (value !== '') {
  //       super.setValueOnReactInstance(formatPhoneNumber(value, this.component?.areaCode));
  //     }
  //   };
  // }
  //
  // getDisplayValue(): string {
  //   return formatPhoneNumber(super.getValue(), this.component?.areaCode);
  // }

  // TODO endre til objekt
  handleChange(value: string) {
    super.handleChange(value);
  }

  getShowAreaCode() {
    return this.component?.showAreaCode;
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        {/*<ComponentLabel*/}
        {/*  component={this.component}*/}
        {/*  editFields={this.getEditFields()}*/}
        {/*  labelIsHidden={this.labelIsHidden()}*/}
        {/*/>*/}
        <NavPhoneNumber
          label={this.getLabel()}
          onChange={this.handleChange.bind(this)}
          readOnly={this.getReadOnly()}
          className={this.getClassName()}
          fieldSize={this.getFieldSize()}
          required={this.isRequired()}
          customLabels={this.getCustomLabels()}
          showAreaCode={this.getShowAreaCode()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
