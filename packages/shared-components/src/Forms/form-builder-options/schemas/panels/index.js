import dineOpplysningerSchema from './dineOpplysningerSchema';
import vedleggPanelSchema from './vedleggPanelSchema';
import veiledningSchema from './veiledningSchema';

const panelSchemas = {
  veiledningSchema,
  dineOpplysningerSchema,
  vedleggSchema: vedleggPanelSchema,
};

export default panelSchemas;
