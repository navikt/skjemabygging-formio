import coAdresseSchema from "./coAdresseSchema";
import utlandVegadressePostboksSchema from "./utlandVegadressePostboksSchema";
import utlandBygningSchema from "./utlandBygningSchema";
import utlandPostkodeSchema from "./utlandPostkodeSchema";
import utlandByStedSchema from "./utlandByStedSchema";
import utlandRegionSchema from "./utlandRegionSchema";
import utlandLandSchema from "./utlandLandSchema";

const utenlandskAdresseSchema = (keyPostfix = "") => ({
  key: `utenlandskAdresse`,
  type: "container",
  label: "Utenlandsk kontaktadresse",
  hideLabel: true,
  input: false,
  tableView: false,
  components: [
    coAdresseSchema(keyPostfix),
    utlandVegadressePostboksSchema(keyPostfix),
    utlandBygningSchema(keyPostfix),
    utlandPostkodeSchema(keyPostfix),
    utlandByStedSchema(keyPostfix),
    utlandRegionSchema(keyPostfix),
    utlandLandSchema(keyPostfix),
  ],
});

export default utenlandskAdresseSchema;
