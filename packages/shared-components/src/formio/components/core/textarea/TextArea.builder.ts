import { defaultBuilderSchema } from '../../base/builderHelper';
import TextArea from './TextArea';

const textAreaBuilder = () => {
  const schema = TextArea.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default textAreaBuilder;
