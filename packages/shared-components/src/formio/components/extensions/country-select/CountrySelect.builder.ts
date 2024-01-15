import CountrySelect from './CountrySelect';

const countrySelectBuilder = () => {
  const schema = CountrySelect.schema();
  return {
    title: 'Landvelger',
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default countrySelectBuilder;
