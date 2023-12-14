import AccountNumber from './AccountNumber';

const accountNumberBuilder = () => {
  const schema = AccountNumber.schema();
  return {
    title: schema.label,
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateAccountNumber(input)',
        customMessage: 'Dette er ikke et gyldig kontonummer',
      },
    },
  };
};

export default accountNumberBuilder;
