import Identity from './Identity';

const identityBuilder = () => {
  const schema = Identity.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      key: schema.key,
      validate: {
        required: true,
      },
    },
  };
};

export default identityBuilder;
