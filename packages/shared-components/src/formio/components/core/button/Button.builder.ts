import { defaultBuilderSchema } from '../../base/builderHelper';
import Button from './Button';

const buttonBuilder = () => {
  const schema = Button.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default buttonBuilder;
