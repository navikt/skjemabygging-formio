import Email from './Email';

const emailBuilder = () => {
  const schema = Email.schema();

  return {
    title: 'E-post',
    schema: {
      ...schema,
      autocomplete: 'email',
      inputType: 'email',
      spellcheck: false,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default emailBuilder;
