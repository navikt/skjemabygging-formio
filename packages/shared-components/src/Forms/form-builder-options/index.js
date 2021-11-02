import { SANITIZE_CONFIG } from "../../template/sanitizeConfig";
import builderEditForm from "./builderEditForm";
import builderPalett from "./builder-palett";

const FormBuilderOptions = {
  builder: builderPalett,
  editForm: builderEditForm,
  language: "nb-NO",
  sanitizeConfig: SANITIZE_CONFIG,
};

export default FormBuilderOptions;
