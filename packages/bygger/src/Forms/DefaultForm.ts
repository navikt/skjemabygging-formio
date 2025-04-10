import { FormBuilderOptions } from '@navikt/skjemadigitalisering-shared-components';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const { veiledning, dineOpplysninger, vedleggpanel } = FormBuilderOptions.builder.panelsGroup.components;

export const defaultFormFields = (): Partial<Component>[] => [
  veiledning.schema,
  dineOpplysninger.schema,
  vedleggpanel.schema as Component,
];
