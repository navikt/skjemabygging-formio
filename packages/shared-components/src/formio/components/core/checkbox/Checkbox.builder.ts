import Checkbox from './Checkbox';

const checkboxBuilder = () => {
  const schema = Checkbox.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
    },
    validateOn: 'blur',
    validate: {
      required: true,
    }
  };
};

export default checkboxBuilder;
