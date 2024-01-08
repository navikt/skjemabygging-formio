import Number from './Number';

const numberBuilder = () => {
  const schema = Number.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default numberBuilder;
