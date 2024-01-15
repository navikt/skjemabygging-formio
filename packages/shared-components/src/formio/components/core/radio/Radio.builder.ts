import Radio from './Radio';

const radioBuilder = () => {
  const schema = Radio.schema();
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

export default radioBuilder;
