import Image from './Image';

const imageBuilder = () => {
  const schema = Image.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default imageBuilder;
