import Day from './Day';

const dayBuilder = () => {
  const schema = Day.schema();
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

export default dayBuilder;
