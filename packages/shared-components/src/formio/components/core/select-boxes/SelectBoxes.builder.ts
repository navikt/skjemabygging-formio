import { defaultBuilderSchema } from '../../base/builderHelper';
import SelectBoxes from './SelectBoxes';

const selectBoxesBuilder = () => {
  const schema = SelectBoxes.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default selectBoxesBuilder;
