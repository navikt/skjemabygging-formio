import IBAN from './IBAN';

const IBANBuilder = () => {
  const schema = IBAN.schema();
  return {
    title: 'IBAN',
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateIban(input);',
      },
    },
  };
};

export default IBANBuilder;
