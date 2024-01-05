import NavSelect from './Select';

const selectBuilder = () => {
  const schema = NavSelect.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default selectBuilder;
