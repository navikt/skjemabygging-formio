import Fieldset from "formiojs/components/fieldset/Fieldset";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

Fieldset.schema = () => FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema;

export default Fieldset;
