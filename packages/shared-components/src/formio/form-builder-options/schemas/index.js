import borDuINorgeSchema from './borDuINorgeSchema';
import epostSchema from './epostSchema';
import firstNameSchema from './firstNameSchema';
import fodselsNummerDNummerSchema from './fodselsNummerDNummerSchema';
import ibanSchema from './ibanSchema';
import norskPostboksadresseSchema from './norskPostboksadresseSchema';
import norskVegadresseSchema from './norskVegadresseSchema';
import panelSchemas from './panels';
import postnummerSchema from './postnummerSchema';
import poststedSchema from './poststedSchema';
import statsborgerskapSchema from './statsborgerskapSchema';
import surnameSchema from './surnameSchema';
import telefonSchema from './telefonSchema';
import utenlandskAdresseSchema from './utenlandskAdresseSchema';
import utlandLandSchema from './utlandLandSchema';
import valutavelgerSchema from './valutavelgerSchema';
import vegadresseSchema from './vegadresseSchema';

export const FormBuilderSchemas = {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  vegadresseSchema,
  postnummerSchema,
  poststedSchema,
  valutavelgerSchema,
  utlandLandSchema,
  epostSchema,
  telefonSchema,
  statsborgerskapSchema,
  borDuINorgeSchema,
  norskVegadresseSchema,
  norskPostboksadresseSchema,
  utenlandskAdresseSchema,
  ibanSchema,
  ...panelSchemas,
};

export default FormBuilderSchemas;
