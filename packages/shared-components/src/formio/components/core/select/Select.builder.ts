import NavSelect from './Select';

const selectBuilder = () => {
  const schema = NavSelect.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default selectBuilder;
