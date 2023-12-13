import { defaultBuilderSchema } from '../../base/builderHelper';
import FormGroup from './FormGroup';

const FormGroupBuilder = () => {
  const schema = FormGroup.schema();
  return {
    title: schema.label,
    group: 'layout',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default FormGroupBuilder;
