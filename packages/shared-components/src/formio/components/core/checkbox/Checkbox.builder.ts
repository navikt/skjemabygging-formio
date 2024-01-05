import Checkbox from './Checkbox';

const checkboxBuilder = () => {
  const schema = Checkbox.schema();
  return {
    title: schema.label,
    group: 'basic',
    schema: {
      ...schema,
    },
    validateOn: 'blur',
  };
};

export default checkboxBuilder;
