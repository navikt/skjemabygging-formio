import { defaultBuilderSchema } from '../../base/builderHelper';
import Radio from './Radio';

const radioBuilder = () => {
  const schema = Radio.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default radioBuilder;
