import address from './Address';

const addressBuilder = () => {
  const schema = address.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
    },
  };
};

export default addressBuilder;
