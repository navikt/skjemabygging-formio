import addressBuilder from '../components/core/address/Address.builder';
import phoneNumberBuilder from '../components/core/phone-number/PhoneNumber.builder';
import citizenshipBuilder from '../components/extensions/citizenship/Citizenship.builder';
import countrySelectBuilder from '../components/extensions/country-select/CountrySelect.builder';
import emailBuilder from '../components/extensions/email/Email.builder';
import firstNameBuilder from '../components/extensions/first-name/FirstName.builder';
import nationalIdentityNumberBuilder from '../components/extensions/national-identity-number/NationalIdentityNumber.builder';
import surnameBuilder from '../components/extensions/surname/Surname.builder';
import yourInformationBuilder from '../components/groups/your-information/YourInformation.builder';
import postnummerSchema from '../form-builder-options/schemas/postnummerSchema';
import poststedSchema from '../form-builder-options/schemas/poststedSchema';
import vegadresseSchema from '../form-builder-options/schemas/vegadresseSchema';

const personGroup = {
  title: 'Person',
  components: {
    yourInformation: yourInformationBuilder(),
    fnrfield: nationalIdentityNumberBuilder(),
    firstName: firstNameBuilder(),
    surname: surnameBuilder(),
    address: addressBuilder(),
    streetAddress: {
      title: 'Vegadresse',
      schema: vegadresseSchema(),
    },
    postcode: {
      title: 'Postnummer',
      schema: postnummerSchema(),
    },
    city: {
      title: 'Poststed',
      schema: poststedSchema(),
    },
    landvelger: countrySelectBuilder(),
    email: emailBuilder(),
    phoneNumber: phoneNumberBuilder(),
    citizenship: citizenshipBuilder(),
  },
};

export default personGroup;
