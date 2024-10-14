import NationalIdentityNumber from './NationalIdentityNumber';

const nationalIdentityNumberBuilder = (keyPostfix: string = '') => {
  const schema = NationalIdentityNumber.schema();
  return {
    title: 'Fødselsnummer',
    schema: {
      ...schema,
      key: `${schema.key}${keyPostfix}`,
      validate: {
        required: true,
      },
    },
  };
};

export default nationalIdentityNumberBuilder;
