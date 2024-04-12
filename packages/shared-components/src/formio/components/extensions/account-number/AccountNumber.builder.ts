import AccountNumber from './AccountNumber';

const accountNumberBuilder = () => {
  const schema = AccountNumber.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateAccountNumber(input)',
      },
    },
  };
};

export default accountNumberBuilder;
