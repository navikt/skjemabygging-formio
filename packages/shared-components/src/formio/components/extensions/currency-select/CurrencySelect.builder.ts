import CurrencySelect from './CurrencySelect';

const currencySelectBuilder = () => {
  const schema = CurrencySelect.schema();
  return {
    title: 'Valutavelger',
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default currencySelectBuilder;
