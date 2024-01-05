import Container from './Container';

const ContainerBuilder = () => {
  const schema = Container.schema();
  return {
    title: schema.label,
    group: 'data',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default ContainerBuilder;
