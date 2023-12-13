import { defaultBuilderSchema } from '../../base/builderHelper';
import Day from './Day';

const dayBuilder = () => {
  const schema = Day.schema();
  return {
    title: schema.label,
    group: 'datoOgTid',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default dayBuilder;
