import dineOpplysningerSchema from "../schemas/panels/dineOpplysningerSchema";
import veiledningSchema from "../schemas/panels/veiledningSchema";
import vedleggSchema from "../schemas/panels/vedleggSchema";

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
      schema: vedleggSchema,
    },
  },
};

export default panelsPalett;
