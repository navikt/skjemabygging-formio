import NationalIdentityNumber from './NationalIdentityNumber';

const nationalIdentityNumberBuilder = () => {
  const schema = NationalIdentityNumber.schema();
  return {
    title: 'Fødselsnummer',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateFnrNew(input)',
      },
    },
  };
};

export default nationalIdentityNumberBuilder;
