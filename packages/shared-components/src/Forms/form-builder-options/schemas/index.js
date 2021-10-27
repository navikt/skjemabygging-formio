import fodselsNummerDNummerSchema from "./fodselsNummerDNummerSchema";
import firstNameSchema from "./firstNameSchema";
import surnameSchema from "./surnameSchema";
import vegadresseSchema from "./vegadresseSchema";
import postnummerSchema from "./postnummerSchema";
import poststedSchema from "./poststedSchema";
import utlandLandSchema from "./utlandLandSchema";
import epostSchema from "./epostSchema";
import telefonSchema from "./telefonSchema";
import statsborgerskapSchema from "./statsborgerskapSchema";
import borDuINorgeSchema from "./borDuINorgeSchema";
import norskVegadresseSchema from "./norskVegadresseSchema";
import norskPostboksadresseSchema from "./norskPostboksadresseSchema";
import utenlandskAdresseSchema from "./utenlandskAdresseSchema";
import panelSchemas from "./panels";

export const FormBuilderSchemas = {
  fodselsNummerDNummerSchema,
  firstNameSchema,
  surnameSchema,
  vegadresseSchema,
  postnummerSchema,
  poststedSchema,
  utlandLandSchema,
  epostSchema,
  telefonSchema,
  statsborgerskapSchema,
  borDuINorgeSchema,
  norskVegadresseSchema,
  norskPostboksadresseSchema,
  utenlandskAdresseSchema,
  ...panelSchemas,
};

export default FormBuilderSchemas;