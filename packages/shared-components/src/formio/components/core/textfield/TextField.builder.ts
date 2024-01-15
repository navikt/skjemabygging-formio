import TextField from './TextField';

const textFieldBuilder = () => {
  const schema = TextField.schema();
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

export default textFieldBuilder;
