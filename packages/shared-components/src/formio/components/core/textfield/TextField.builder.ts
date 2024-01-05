import TextField from './TextField';

const textFieldBuilder = () => {
  const schema = TextField.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default textFieldBuilder;
