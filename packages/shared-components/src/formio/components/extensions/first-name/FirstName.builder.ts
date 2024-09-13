import FirstName from './FirstName';

const firstNameBuilder = (keyPostfix = '') => {
  const schema = FirstName.schema();

  return {
    title: schema.label,
    schema: {
      ...schema,
      key: `fornavn${keyPostfix}`,
      validate: {
        required: true,
      },
    },
  };
};

export default firstNameBuilder;
