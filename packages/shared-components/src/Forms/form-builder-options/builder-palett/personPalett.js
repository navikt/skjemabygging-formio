import fodselsNummerDNummerSchema from "../schemas/fodselsNummerDNummerSchema";
import firstNameSchema from "../schemas/firstNameSchema";
import surnameSchema from "../schemas/surnameSchema";
import norskVegadresseSchema from "../schemas/norskVegadresseSchema";
import norskPostboksadresseSchema from "../schemas/norskPostboksadresseSchema";
import utenlandskAdresseSchema from "../schemas/utenlandskAdresseSchema";
import vegadresseSchema from "../schemas/vegadresseSchema";
import postnummerSchema from "../schemas/postnummerSchema";
import poststedSchema from "../schemas/poststedSchema";
import utlandLandSchema from "../schemas/utlandLandSchema";
import epostSchema from "../schemas/epostSchema";
import telefonSchema from "../schemas/telefonSchema";
import statsborgerskapSchema from "../schemas/statsborgerskapSchema";

const personPalett = {
  title: "Person",
  components: {
    /*personalia: {
      title: "Personalia",
      key: "personalia",
      icon: "user",
      weight: 0,
      schema: personaliaSchema(),
    },*/
    fnrfield: {
      title: "Fødselsnummer",
      group: "person",
      icon: "user",
      weight: 10,
      schema: fodselsNummerDNummerSchema(),
    },
    firstName: {
      title: "Fornavn",
      key: "fornavn",
      icon: "user",
      weight: 20,
      schema: firstNameSchema(),
    },
    surname: {
      title: "Etternavn",
      key: "etternavn",
      icon: "user",
      weight: 30,
      schema: surnameSchema(),
    },
    /*komplettKontaktInfo: {
      title: "Komplett kontaktinfo",
      key: "komplettKontaktinfo",
      icon: "home",
      weight: 40,
      schema: komplettKontaktInfoSchema(),
    },*/
    norskVegadresse: {
      title: "Norsk vegadresse",
      icon: "home",
      key: "norskVegadresse",
      weight: 40,
      schema: norskVegadresseSchema(),
    },
    norskPostboksadresse: {
      title: "Norsk postboksadresse",
      key: "norskPostboksadresse",
      icon: "home",
      weight: 40,
      schema: norskPostboksadresseSchema(),
    },
    utenlandskAdresse: {
      title: "Utenlandsk adresse",
      key: "utenlandskAdresse",
      icon: "home",
      weight: 40,
      schema: utenlandskAdresseSchema(),
    },
    streetAddress: {
      title: "Vegdresse",
      key: "vegadresse",
      icon: "home",
      weight: 50,
      schema: vegadresseSchema(),
    },
    postcode: {
      title: "Postnummer",
      key: "postnr",
      icon: "home",
      weight: 60,
      schema: postnummerSchema(),
    },
    city: {
      title: "Poststed",
      key: "poststed",
      icon: "home",
      weight: 70,
      schema: poststedSchema(),
    },
    land: {
      title: "Land",
      key: "land",
      icon: "home",
      weight: 70,
      schema: utlandLandSchema(),
    },
    email: {
      title: "E-post",
      key: "epost",
      icon: "at",
      weight: 80,
      schema: epostSchema(),
    },
    phoneNumber: {
      title: "Telefon",
      key: "telefonnummer",
      icon: "phone-square",
      weight: 90,
      schema: telefonSchema(),
    },
    citizenship: {
      title: "Statsborgerskap",
      key: "statsborgerskap",
      icon: "user",
      weight: 100,
      schema: statsborgerskapSchema(),
    },
  },
};

export default personPalett;