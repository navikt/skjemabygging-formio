import dineOpplysningerSchema from "../schemas/panels/dineOpplysningerSchema";
import veiledningSchema from "../schemas/panels/veiledningSchema";
import vedleggPanelSchema from "../schemas/panels/vedleggPanelSchema";

const panelsPalett = {
  title: "Paneler",
  components: {
    veiledning: {
      title: "Veiledning",
      key: "veiledning",
      weight: "10",
      schema: veiledningSchema,
    },
    dineOpplysninger: {
      title: "Dine opplysninger",
      key: "dineopplysninger",
      weight: "20",
      schema: dineOpplysningerSchema,
    },
    vedleggpanel: {
      title: "Vedlegg",
      key: "vedleggpanel",
      weight: "30",
      schema: vedleggPanelSchema,
    },
  },
};

export default panelsPalett;
