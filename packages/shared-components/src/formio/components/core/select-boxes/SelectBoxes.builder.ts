import SelectBoxes from './SelectBoxes';

const selectBoxesBuilder = () => {
  const schema = SelectBoxes.schema();
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

export default selectBoxesBuilder;
