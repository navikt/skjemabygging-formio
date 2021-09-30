import { SANITIZE_CONFIG } from "../../template/sanitizeConfig";
import builderEditForm from "./builderEditForm";
import builderPalett from "./builder-palett";
//import { defaultFormFields } from "../../../bygger/src/Forms/DefaultForm";

const postboksPrefix = "postboks";
const utlandPrefix = "utland";

/*const personaliaSchema = (keyPostfix = "") => ({
  label: "Personalia",
  hideLabel: true,
  type: "container",
  key: "personalia",
  input: true,
  components: [fodselsNummerDNummerSchema(keyPostfix), firstNameSchema(keyPostfix), surnameSchema(keyPostfix)],
});*/

/*const komplettKontaktInfoSchema = (keyPostfix = "") => ({
  label: "Komplett kontaktinfo",
  hideLabel: true,
  type: "container",
  key: `komplettKontaktinfo${keyPostfix}`,
  input: true,
  components: [],
});*/

const FormBuilderOptions = {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
  sanitizeConfig: SANITIZE_CONFIG,
};

export default FormBuilderOptions;
