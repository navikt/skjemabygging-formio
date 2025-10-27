import {
  Address as AddressDomain,
  AddressType,
  numberUtils,
  PrefillAddress,
  SubmissionAddress,
  TEXTS,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import NavAddress, { SubmissionAddressType } from '../../../../components/address/Address';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import { getCountryObject } from '../../../../util/countries/countries';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
  constructor(...args: any[]) {
    // @ts-expect-error args
    super(...args);
    this.noMainRef();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Adresse',
      type: 'navAddress',
      key: 'adresse',
      hideLabel: true,
    });
  }

  static editForm() {
    return addressForm();
  }

  static get builderInfo() {
    return addressBuilder();
  }

  init() {
    super.init();
    this.initAddress();
  }

  initAddress() {
    if (this.isSubmissionDigital() && this.component?.prefillKey && this.component?.prefillValue) {
      const prefillAddresses = this.component?.prefillValue as PrefillAddress;
      let prefillAddress: AddressDomain;
      if (this.component?.addressPriority === 'oppholdsadresse') {
        prefillAddress =
          this.getOppholdsadresse(prefillAddresses) ??
          this.getKontaktadresse(prefillAddresses) ??
          this.getBostedsadresse(prefillAddresses);
      } else if (this.component?.addressPriority === 'kontaktadresse') {
        prefillAddress =
          this.getKontaktadresse(prefillAddresses) ??
          this.getBostedsadresse(prefillAddresses) ??
          this.getOppholdsadresse(prefillAddresses);
      } else {
        prefillAddress =
          this.getBostedsadresse(prefillAddresses) ??
          this.getOppholdsadresse(prefillAddresses) ??
          this.getKontaktadresse(prefillAddresses);
      }

      if (prefillAddress) {
        if (prefillAddress.landkode) {
          super.setValue({
            ...prefillAddress,
            land: getCountryObject(prefillAddress.landkode),
          });
        } else {
          this.setValue(prefillAddress);
        }
      }
    }
  }

  getAddressType(): AddressType | undefined {
    if (this.component?.addressType) {
      return this.component?.addressType;
    }

    if (this.component?.prefillKey) {
      const address = this.getValue();
      if (this.isSubmissionDigital()) {
        if (
          address?.landkode &&
          address?.landkode?.toLowerCase() !== 'nor' &&
          address?.landkode?.toLowerCase() !== 'no'
        ) {
          return 'FOREIGN_ADDRESS';
        } else if (address?.postboks) {
          return 'POST_OFFICE_BOX';
        }

        return 'NORWEGIAN_ADDRESS';
      } else if (address?.borDuINorge === 'ja') {
        if (address?.vegadresseEllerPostboksadresse === 'vegadresse') {
          return 'NORWEGIAN_ADDRESS';
        } else if (address?.vegadresseEllerPostboksadresse === 'postboksadresse') {
          return 'POST_OFFICE_BOX';
        }
      } else if (address?.borDuINorge === 'nei') {
        return 'FOREIGN_ADDRESS';
      }
    }
  }

  getBostedsadresse(addresses) {
    if (addresses?.bostedsadresse) {
      return addresses?.bostedsadresse;
    }
  }

  getOppholdsadresse(addresses) {
    if (addresses?.oppholdsadresser?.[0]) {
      return addresses?.oppholdsadresser[0];
    }
  }

  getKontaktadresse(addresses) {
    if (addresses?.kontaktadresser?.[0]) {
      return addresses?.kontaktadresser[0];
    }
  }

  handleChange(value: AddressDomain) {
    super.handleChange(value);
    this.rerender();
  }

  getReadOnly(): boolean {
    return this.hasPrefill() || super.getReadOnly();
  }

  showAddressTypeChoice(): boolean {
    return !!this.component?.prefillKey && this.isSubmissionPaper();
  }

  setValue(value: any) {
    // If prefillKey is set, never set the value, not even from previously saved submissions.
    if (!this.component?.prefillKey) {
      super.setValue(value);
    }
  }

  checkComponentValidity(data, dirty, row, _options = {}) {
    this.removeAllErrors();

    if (this.shouldSkipValidation(data, dirty, row) || this.getReadOnly()) {
      return true;
    }

    const address = this.getValue() ?? ({} as AddressDomain);
    this.validateRequiredFields(address);
    this.validateTextInputs(address);

    this.rerender();

    return this.componentErrors.length === 0;
  }

  validateRequiredFields(address: SubmissionAddress) {
    if (!this.isRequired()) {
      return;
    }

    if (this.getAddressType() === 'NORWEGIAN_ADDRESS') {
      this.validateRequiredField(address, 'adresse', TEXTS.statiske.address.streetAddress);
      this.validateRequiredField(address, 'postnummer', TEXTS.statiske.address.postalCode);
      this.validateRequiredField(address, 'bySted', TEXTS.statiske.address.postalName);
    } else if (this.getAddressType() === 'POST_OFFICE_BOX') {
      this.validateRequiredField(address, 'postboks', TEXTS.statiske.address.poBox);
      this.validateRequiredField(address, 'postnummer', TEXTS.statiske.address.postalCode);
      this.validateRequiredField(address, 'bySted', TEXTS.statiske.address.postalName);
    } else if (this.getAddressType() === 'FOREIGN_ADDRESS') {
      this.validateRequiredField(address, 'adresse', TEXTS.statiske.address.streetAddressLong);
      this.validateRequiredField(address, 'land', TEXTS.statiske.address.country);
    }

    if (this.showAddressTypeChoice()) {
      this.validateRequiredField(address, 'borDuINorge', TEXTS.statiske.address.livesInNorway);
      if (address.borDuINorge === 'ja') {
        this.validateRequiredField(
          address,
          'vegadresseEllerPostboksadresse',
          TEXTS.statiske.address.yourContactAddress,
        );
      }
    }
  }

  validateTextInputs(address: SubmissionAddress) {
    if (this.getAddressType() === 'NORWEGIAN_ADDRESS') {
      this.validateTextInput(address, 'co', TEXTS.statiske.address.co.label);
      this.validateTextInput(address, 'adresse', TEXTS.statiske.address.streetAddress);
      this.validateNorwegianPostalCode(address['postnummer'], TEXTS.statiske.address.postalCode);
      this.validateTextInput(address, 'bySted', TEXTS.statiske.address.postalName);
    } else if (this.getAddressType() === 'POST_OFFICE_BOX') {
      this.validateTextInput(address, 'co', TEXTS.statiske.address.co.label);
      this.validateTextInput(address, 'postboks', TEXTS.statiske.address.poBox);
      this.validateNorwegianPostalCode(address['postnummer'], TEXTS.statiske.address.postalCode);
      this.validateTextInput(address, 'bySted', TEXTS.statiske.address.postalName);
    } else if (this.getAddressType() === 'FOREIGN_ADDRESS') {
      this.validateTextInput(address, 'co', TEXTS.statiske.address.co.label);
      this.validateTextInput(address, 'adresse', TEXTS.statiske.address.streetAddressLong);
      this.validateTextInput(address, 'bygning', TEXTS.statiske.address.building);
      this.validateTextInput(address, 'postnummer', TEXTS.statiske.address.postalCode);
      this.validateTextInput(address, 'bySted', TEXTS.statiske.address.location);
      this.validateTextInput(address, 'region', TEXTS.statiske.address.region);
    }
  }

  validateRequiredField(address: SubmissionAddress, addressType: SubmissionAddressType, label: string) {
    const elementId = `address:${addressType}`;
    if (!address[addressType]) {
      super.addError(this.translate('required', { field: this.translate(label) }), elementId);
    }
  }

  validateTextInput(address: SubmissionAddress, addressType: SubmissionAddressType, label: string) {
    const elementId = `address:${addressType}`;
    if (!validatorUtils.isValidFoerstesideValue((address[addressType] ?? '') as string)) {
      super.addError(this.translate('containsInvalidCharacters', { field: this.translate(label) }), elementId);
    }
  }

  validateNorwegianPostalCode(value: string | undefined, label: string) {
    const elementId = `address:postnummer`;
    if (!value) {
      return;
    }
    if (value.length !== 4 || !numberUtils.isValidInteger(value)) {
      super.addError(this.translate('invalidPostalCode', { field: this.translate(label) }), elementId);
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
        <NavAddress
          onChange={this.handleChange.bind(this)}
          addressType={this.getAddressType()}
          address={this.getValue()}
          readOnly={this.getReadOnly()}
          addressTypeChoice={this.showAddressTypeChoice()}
          className={this.getClassName()}
          fieldSize={this.getFieldSize()}
          required={this.isRequired()}
          customLabels={this.getCustomLabels()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default Address;
