import IBAN from './IBAN';

const IBANBuilder = () => {
  const schema = IBAN.schema();
  return {
    title: 'IBAN',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default IBANBuilder;
