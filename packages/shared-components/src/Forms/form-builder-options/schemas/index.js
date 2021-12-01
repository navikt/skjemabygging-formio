import borDuINorgeSchema from "./borDuINorgeSchema";
import epostSchema from "./epostSchema";
import firstNameSchema from "./firstNameSchema";
import fodselsNummerDNummerSchema from "./fodselsNummerDNummerSchema";
import ibanSchema from "./ibanSchema";
import landvelgerSchema from "./landvelgerSchema";
import norskPostboksadresseSchema from "./norskPostboksadresseSchema";
import norskVegadresseSchema from "./norskVegadresseSchema";
import panelSchemas from "./panels";
import postnummerSchema from "./postnummerSchema";
import poststedSchema from "./poststedSchema";
import statsborgerskapSchema from "./statsborgerskapSchema";
import surnameSchema from "./surnameSchema";
import telefonSchema from "./telefonSchema";
import utenlandskAdresseSchema from "./utenlandskAdresseSchema";
import utlandLandSchema from "./utlandLandSchema";
import vegadresseSchema from "./vegadresseSchema";

export const FormBuilderSchemas = {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  vegadresseSchema,
  postnummerSchema,
  poststedSchema,
  landvelgerSchema,
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
