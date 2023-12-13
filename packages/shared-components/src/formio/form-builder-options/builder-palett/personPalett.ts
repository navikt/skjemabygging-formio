import citizenshipBuilder from '../../components/extensions/citizenship/Citizenship.builder';
import countrySelectBuilder from '../../components/extensions/country-select/CountrySelect.builder';
import emailBuilder from '../../components/extensions/email/Email.builder';
import firstNameBuilder from '../../components/extensions/first-name/FirstName.builder';
import nationalIdentityNumberBuilder from '../../components/extensions/national-identity-number/NationalIdentityNumber.builder';
import phoneNumberBuilder from '../../components/extensions/phone-number/PhoneNumber.builder';
import surnameBuilder from '../../components/extensions/surname/Surname.builder';
import norskPostboksadresseSchema from '../schemas/norskPostboksadresseSchema';
import norskVegadresseSchema from '../schemas/norskVegadresseSchema';
import postnummerSchema from '../schemas/postnummerSchema';
import poststedSchema from '../schemas/poststedSchema';
import utenlandskAdresseSchema from '../schemas/utenlandskAdresseSchema';
import utlandLandSchema from '../schemas/utlandLandSchema';
import vegadresseSchema from '../schemas/vegadresseSchema';

const personPalett = {
  title: 'Person',
  components: {
    fnrfield: nationalIdentityNumberBuilder(),
    firstName: firstNameBuilder(),
    surname: surnameBuilder(),
    norskVegadresse: {
      title: 'Norsk vegadresse',
      icon: 'home',
      key: 'norskVegadresse',
      weight: 40,
      schema: norskVegadresseSchema(),
    },
    norskPostboksadresse: {
      title: 'Norsk postboksadresse',
      key: 'norskPostboksadresse',
      icon: 'home',
      weight: 40,
      schema: norskPostboksadresseSchema(),
    },
    utenlandskAdresse: {
      title: 'Utenlandsk adresse',
      key: 'utenlandskAdresse',
      icon: 'home',
      weight: 40,
      schema: utenlandskAdresseSchema(),
    },
    streetAddress: {
      title: 'Vegdresse',
      key: 'vegadresse',
      icon: 'home',
      weight: 50,
      schema: vegadresseSchema(),
    },
    postcode: {
      title: 'Postnummer',
      key: 'postnr',
      icon: 'home',
      weight: 60,
      schema: postnummerSchema(),
    },
    city: {
      title: 'Poststed',
      key: 'poststed',
      icon: 'home',
      weight: 70,
      schema: poststedSchema(),
    },
    land: {
      title: 'Land',
      key: 'land',
      icon: 'home',
      weight: 70,
      schema: utlandLandSchema(),
    },
    landvelger: countrySelectBuilder(),
    email: emailBuilder(),
    phoneNumber: phoneNumberBuilder(),
    citizenship: citizenshipBuilder(),
  },
};

export default personPalett;
