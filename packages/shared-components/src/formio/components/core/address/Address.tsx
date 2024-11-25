import { Alert } from '@navikt/ds-react';
import {
  Address as AddressDomain,
  AddressType,
  PrefillAddress,
  SubmissionAddress,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import NavAddress, { SubmissionAddressType } from '../../../../components/address/Address';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import { getCountryObject } from '../../../../util/countries/countries';
import BaseComponent from '../../base/BaseComponent';
import ComponentLabel from '../../base/components/ComponentLabel';
import addressBuilder from './Address.builder';
import addressForm from './Address.form';

class Address extends BaseComponent {
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
    return !!this.component?.prefillKey && this.isSubmissionDigital();
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

  get errors() {
    return this.componentErrors;
  }

  checkComponentValidity(data, dirty, row, _options = {}) {
    this.removeAllErrors();

    if (this.shouldSkipValidation(data, dirty, row) || this.getReadOnly()) {
      return true;
    }

    const address = this.getValue() ?? ({} as AddressDomain);
    if (this.isRequired()) {
      if (this.getAddressType() === 'NORWEGIAN_ADDRESS') {
        this.validateRequiredField(address, 'adresse', TEXTS.statiske.address.streetAddress);
        this.validateRequiredField(address, 'postnummer', TEXTS.statiske.address.postalCode);
        this.validateRequiredField(address, 'bySted', TEXTS.statiske.address.postalName);
      } else if (this.getAddressType() === 'POST_OFFICE_BOX') {
        this.validateRequiredField(address, 'postboks', TEXTS.statiske.address.poBox);
        this.validateRequiredField(address, 'postnummer', TEXTS.statiske.address.postalCode);
        this.validateRequiredField(address, 'bySted', TEXTS.statiske.address.postalName);
      } else if (this.getAddressType() === 'FOREIGN_ADDRESS') {
        this.validateRequiredField(address, 'adresse', TEXTS.statiske.address.streetAddress);
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

      this.rerender();
    }

    return this.componentErrors.length === 0;
  }

  validateRequiredField(address: SubmissionAddress, addressType: SubmissionAddressType, label: string) {
    if (!address[addressType]) {
      const elementId = `address:${addressType}`;
      super.addError(this.translate('required', { field: label }), elementId);
    }
  }

  showMissingAddressWarning() {
    return (
      this.isSubmissionDigital() &&
      !this.getAppConfig()?.config?.isProdGcp &&
      !this.getValue() &&
      !!this.component?.prefillKey
    );
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <ComponentLabel
          component={this.component}
          editFields={this.getEditFields()}
          labelIsHidden={this.labelIsHidden()}
        />
        {this.showMissingAddressWarning() && (
          <Alert variant="warning" className="mb-4">
            Vi fant ikke noen adresse på denne testbrukeren. Legg inn adresse på brukeren i Dolly, eller bruk en annen
            testbruker som har registrert adresse. (denne meldingen vises ikke i produksjon).
          </Alert>
        )}
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
