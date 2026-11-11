import { createFormGroup } from '@navikt/skjemadigitalisering-shared-domain';
import FormGroup from './FormGroup';

const FormGroupBuilder = () => {
  const schema = FormGroup.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      ...createFormGroup(),
      validateOn: 'blur',
      validate: {
        required: false,
      },
    },
  };
};

export default FormGroupBuilder;
