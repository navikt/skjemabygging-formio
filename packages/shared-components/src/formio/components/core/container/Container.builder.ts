import Container from './Container';

const ContainerBuilder = () => {
  const schema = Container.schema();
  return {
    title: schema.label,
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
