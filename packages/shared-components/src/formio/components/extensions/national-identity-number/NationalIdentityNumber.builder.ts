import NationalIdentityNumber from './NationalIdentityNumber';

const nationalIdentityNumberBuilder = (keyPostfix: string = '') => {
  const schema = NationalIdentityNumber.schema();
  return {
    title: 'Fødselsnummer',
    schema: {
      ...schema,
      key: `${schema.key}${keyPostfix}`,
      validateOn: 'blur',
      validate: {
        required: true,
        custom: 'valid = instance.validateFnrNew(input)',
      },
    },
  };
};

export default nationalIdentityNumberBuilder;
