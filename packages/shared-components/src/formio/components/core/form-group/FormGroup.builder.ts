import FormGroup from './FormGroup';

const FormGroupBuilder = () => {
  const schema = FormGroup.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: false,
      },
    },
  };
};

export default FormGroupBuilder;
