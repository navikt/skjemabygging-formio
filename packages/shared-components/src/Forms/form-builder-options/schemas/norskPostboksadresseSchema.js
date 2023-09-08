import coAdresseSchema from "./coAdresseSchema";
import postnummerSchema from "./postnummerSchema";
import poststedSchema from "./poststedSchema";
import postboksSchema from "./postboksSchema";

const norskPostboksadresseSchema = (keyPostfix = "") => ({
  key: "norskPostboksadresse",
  type: "container",
  label: "Postboksadresse",
  hideLabel: true,
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(keyPostfix),
    postboksSchema(keyPostfix),
    postnummerSchema(keyPostfix),
    poststedSchema(keyPostfix),
  ],
});

export default norskPostboksadresseSchema;
