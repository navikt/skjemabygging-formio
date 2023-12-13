import { defaultBuilderSchema } from '../../base/builderHelper';
import NavSelect from './Select';

const selectBuilder = () => {
  const schema = NavSelect.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default selectBuilder;
