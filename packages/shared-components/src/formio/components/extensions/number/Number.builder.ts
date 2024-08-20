import Number from './Number';

const numberBuilder = () => {
  const schema = Number.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      inputType: 'numeric',
      validate: {
        required: true,
      },
    },
  };
};

export default numberBuilder;
