import { defaultBuilderSchema } from '../../base/builderHelper';
import Container from './Container';

const ContainerBuilder = () => {
  const schema = Container.schema();
  return {
    title: schema.label,
    group: 'data',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default ContainerBuilder;
