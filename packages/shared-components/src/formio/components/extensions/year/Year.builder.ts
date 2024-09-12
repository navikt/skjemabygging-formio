import Year from './Year';

const yearBuilder = () => {
  const schema = Year.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      inputType: 'numeric',
      validate: {
        required: true,
      },
    },
  };
};

export default yearBuilder;
