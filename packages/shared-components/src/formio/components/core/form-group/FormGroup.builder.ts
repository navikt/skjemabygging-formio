import FormGroup from './FormGroup';

const FormGroupBuilder = () => {
  const schema = FormGroup.schema();
  return {
    title: schema.label,
    group: 'layout',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default FormGroupBuilder;
