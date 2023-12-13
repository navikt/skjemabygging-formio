import { defaultBuilderSchema } from '../../base/builderHelper';
import Number from './Number';

const numberBuilder = () => {
  const schema = Number.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default numberBuilder;
