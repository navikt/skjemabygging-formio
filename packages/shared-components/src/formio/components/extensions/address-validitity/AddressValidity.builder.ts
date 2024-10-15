import AddressValidity from './AddressValidity';

const addressValidityBuilder = () => {
  const schema = AddressValidity.schema();
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

export default addressValidityBuilder;
