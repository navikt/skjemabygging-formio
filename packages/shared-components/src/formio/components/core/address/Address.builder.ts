import address from './Address';

const addressBuilder = () => {
  const schema = address.schema();
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

export default addressBuilder;
