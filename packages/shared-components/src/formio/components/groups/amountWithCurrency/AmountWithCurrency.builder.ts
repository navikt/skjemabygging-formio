import currencySelectBuilder from '../../extensions/currency-select/CurrencySelect.builder';
import currencyBuilder from '../../extensions/currency/Currency.builder';

const amountWithCurrencyBuilder = () => {
  return {
    title: 'Beløp med valuta',
    schema: {
      label: 'Angi valuta og beløp',
      components: [
        currencySelectBuilder().schema,
        {
          ...currencyBuilder().schema,
          type: 'number',
        },
      ],
      type: 'row',
      isAmountWithCurrencySelector: true,
    },
  };
};

export default amountWithCurrencyBuilder;
