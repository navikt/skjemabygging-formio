import veiledningSchema from "./veiledningSchema";
import dineOpplysningerSchema from "./dineOpplysningerSchema";
import vedleggPanelSchema from "./vedleggPanelSchema";

const panelSchemas = {
  veiledningSchema,
  dineOpplysningerSchema,
  vedleggSchema: vedleggPanelSchema,
};

export default panelSchemas;
