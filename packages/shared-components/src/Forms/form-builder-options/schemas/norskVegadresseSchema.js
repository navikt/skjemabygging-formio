import coAdresseSchema from "./coAdresseSchema";
import vegadresseSchema from "./vegadresseSchema";
import postnummerSchema from "./postnummerSchema";
import poststedSchema from "./poststedSchema";

const norskVegadresseSchema = (keyPostfix = "") => ({
  key: "norskVegadresse",
  type: "container",
  label: "Kontaktadresse",
  hideLabel: true,
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(keyPostfix),
    vegadresseSchema(keyPostfix),
    postnummerSchema(keyPostfix),
    poststedSchema(keyPostfix),
  ],
});

export default norskVegadresseSchema;