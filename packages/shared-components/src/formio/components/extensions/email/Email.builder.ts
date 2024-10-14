import Email from './Email';

const emailBuilder = () => {
  const schema = Email.schema();

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

export default emailBuilder;
