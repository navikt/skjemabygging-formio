import { Alert } from '@navikt/ds-react';
import { Address as AddressDomain, AddressType, SubmissionAddress } from '@navikt/skjemadigitalisering-shared-domain';
import NavAddress from '../../../../components/address/Address';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
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
      const addresses = this.component?.prefillValue as SubmissionAddress;
      if (this.component?.addressPriority === 'oppholdsadresse') {
        super.setValue(
          this.getOppholdsadresse(addresses) ?? this.getKontaktadresse(addresses) ?? this.getBostedsadresse(addresses),
        );
      } else if (this.component?.addressPriority === 'kontaktadresse') {
        super.setValue(
          this.getKontaktadresse(addresses) ?? this.getBostedsadresse(addresses) ?? this.getOppholdsadresse(addresses),
        );
      } else {
        super.setValue(
          this.getBostedsadresse(addresses) ?? this.getOppholdsadresse(addresses) ?? this.getKontaktadresse(addresses),
        );
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
      } else if (address?.borDuINorge === 'true') {
        if (address?.vegadresseEllerPostboksadresse === 'vegadresse') {
          return 'NORWEGIAN_ADDRESS';
        } else if (address?.vegadresseEllerPostboksadresse === 'postboksadresse') {
          return 'POST_OFFICE_BOX';
        }
      } else if (address?.borDuINorge === 'false') {
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

  renderReact(element) {
    element.render(
      this.builderMode && !this.getAddressType() ? (
        <Alert variant="info">
          Adressekomponenten er satt opp med preutfylling fra PDL for digital innsending. For papirinnsending vil vi
          vise valg av bosted for å gi dem riktige adressefelter. Bruk forhåndsvisning for å se hvordan dette ser ut på
          papirinnsending.
        </Alert>
      ) : (
        <ComponentUtilsProvider component={this}>
          <NavAddress
            onChange={this.handleChange.bind(this)}
            addressType={this.getAddressType()}
            address={this.getValue()}
            readOnly={this.getReadOnly()}
            addressTypeChoice={this.showAddressTypeChoice()}
            className={this.getClassName()}
          />
        </ComponentUtilsProvider>
      ),
    );
  }
}

export default Address;
