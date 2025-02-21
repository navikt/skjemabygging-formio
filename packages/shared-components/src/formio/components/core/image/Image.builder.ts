import Image from './Image';

const imageBuilder = () => {
  const schema = Image.schema();
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

export default imageBuilder;
