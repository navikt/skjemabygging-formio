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

  getAddressType(): AddressType | undefined {
    console.log(this.component?.addressType, this.component?.prefillKey);
    if (this.component?.addressType) {
      return this.component?.addressType;
    }

    if (this.component?.prefillKey) {
      const address = this.getAddress();
      if (address?.landkode && address?.landkode?.toLowerCase() !== 'no') {
        return 'FOREIGN_ADDRESS';
      } else if (address?.postboks) {
        return 'POST_OFFICE_BOX';
      }

      return 'NORWEGIAN_ADDRESS';
    }
  }

  getAddress(): AddressDomain | undefined {
    if (this.getValue()) {
      const addresses = (this.getValue() as SubmissionAddress).sokerAdresser;
      // TODO: delete
      console.log('Adresser fra PDL', addresses);

      if (this.component?.addressPriority === 'oppholdsadresse') {
        return this.getBostedsadresse(addresses) ?? this.getAddressInDefaultOrder(addresses);
      } else if (this.component?.addressPriority === 'kontaktadresse') {
        return this.getKontaktadresse(addresses) ?? this.getAddressInDefaultOrder(addresses);
      } else {
        return this.getAddressInDefaultOrder(addresses);
      }
    }
  }

  getAddressInDefaultOrder(addresses) {
    return this.getBostedsadresse(addresses) ?? this.getOppholdsadresse(addresses) ?? this.getKontaktadresse(addresses);
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
  }

  renderReact(element) {
    // TODO: delete
    /*this.dataValue = {
      sokerAdresser: {
        bostedsadresse: {
          //co: 'Lars Olav Torvik',
          adresse: 'Steinliveien 12',
          bygning: 'c',
          postnummer: '1185',
          bySted: 'Oslo',
          postboks: '1000',
          region: 'Region Oslo',
          landkode: 'SE',
        }
      }
    };*/

    element.render(
      <ComponentUtilsProvider component={this}>
        <NavAddress
          onChange={this.handleChange.bind(this)}
          addressType={this.getAddressType()}
          address={this.getAddress()}
          readOnly={this.getReadOnly()}
          className={this.getClassName()}
          // TODO: Find a way add a check for previewMode, since builderMode is false in modal preview.
          hideIfEmpty={!this.builderMode}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default Address;
