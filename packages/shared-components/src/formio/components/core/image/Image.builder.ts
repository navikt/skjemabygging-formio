import { defaultBuilderSchema } from '../../base/builderHelper';
import Image from './Image';

const imageBuilder = () => {
  const schema = Image.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default imageBuilder;
