import { defaultBuilderInfoSchema } from '../../base/builderHelper';
import TextField from './TextField';

const textFieldBuilder = () => {
  return {
    title: 'Tekstfelt',
    group: 'basic',
    schema: {
      ...defaultBuilderInfoSchema(),
      ...TextField.schema(),
    },
  };
};

export default textFieldBuilder;
