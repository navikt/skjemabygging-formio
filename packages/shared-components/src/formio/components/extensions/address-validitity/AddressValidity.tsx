import { Address as AddressDomain, dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavAddressValidity from '../../../../components/address/AddressValidity';
import { validateDate } from '../../../../components/datepicker/dateValidation';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import addressValidityBuilder from './AddressValidity.builder';
import addressValidityForm from './AddressValidity.form';

export default class AddressValidity extends BaseComponent {
  constructor(...args: any[]) {
    // @ts-expect-error args
    super(...args);
    this.noMainRef();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Adresse varighet',
      type: 'addressValidity',
      key: 'adresseVarighet',
      fieldSize: 'input--s',
      hideLabel: true,
    });
  }

  static editForm() {
    return addressValidityForm();
  }

  static get builderInfo() {
    return addressValidityBuilder();
  }

  checkValidity(data, dirty, row) {
    this.removeAllErrors();

    if (this.shouldSkipValidation(data, dirty, row)) {
      return true;
    }

    const address = this.getValue() ?? ({} as AddressDomain);
    const fromErrorMessage = validateDate(
      {
        required: this.isRequired(),
        value: address.gyldigFraOgMed,
        label: TEXTS.statiske.address.validTo,
        fromDate: dateUtils.addDays(-365),
        toDate: dateUtils.addDays(365),
      },
      this.translate.bind(this),
    );

    if (fromErrorMessage) {
      super.addError(fromErrorMessage, 'gyldigFraOgMed');
    }

    const toErrorMessage = validateDate(
      {
        required: false,
        value: address.gyldigTilOgMed,
        label: TEXTS.statiske.address.validFrom,
        fromDate: address?.gyldigFraOgMed || dateUtils.addDays(-365),
        toDate: dateUtils.addDays(365),
      },
      this.translate.bind(this),
    );

    if (toErrorMessage) {
      super.addError(toErrorMessage, 'gyldigTilOgMed');
    }

    this.rerender();

    return this.componentErrors.length === 0;
  }

  handleChange(value: AddressDomain) {
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
        <NavAddressValidity
          onChange={this.handleChange.bind(this)}
          address={this.getValue()}
          readOnly={this.getReadOnly()}
          className={this.getClassName()}
          required={this.isRequired()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
