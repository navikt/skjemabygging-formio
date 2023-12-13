import { defaultBuilderSchema } from '../../base/builderHelper';
import TextField from './TextField';

const textFieldBuilder = () => {
  const schema = TextField.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default textFieldBuilder;
