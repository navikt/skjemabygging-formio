import { defaultBuilderSchema } from '../../base/builderHelper';
import CurrencySelect from './CurrencySelect';

const currencySelectBuilder = () => {
  const schema = CurrencySelect.schema();
  return {
    title: 'Valutavelger',
    group: 'pengerOgKonto',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default currencySelectBuilder;
