import { FormBuilderSchemas } from "@navikt/skjemadigitalisering-shared-components";

const { veiledningSchema, dineOpplysningerSchema, vedleggSchema } = FormBuilderSchemas;

export const defaultFormFields = () => [veiledningSchema, dineOpplysningerSchema, vedleggSchema];
