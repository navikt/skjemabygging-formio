import { defaultBuilderSchema } from '../../base/builderHelper';
import Checkbox from './Checkbox';

const checkboxBuilder = () => {
  const schema = Checkbox.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default checkboxBuilder;
