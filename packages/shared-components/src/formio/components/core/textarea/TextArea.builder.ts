import TextArea from './TextArea';

const textAreaBuilder = () => {
  const schema = TextArea.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default textAreaBuilder;
