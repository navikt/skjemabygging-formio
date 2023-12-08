import { defaultBuilderInfoSchema } from '../../base/builderHelper';
import CurrencySelect from './CurrencySelect';

const currencySelectBuilder = () => {
  return {
    title: 'Valutavelger',
    key: 'valutavelger',
    group: 'pengerOgKonto',
    icon: 'home',
    schema: {
      ...defaultBuilderInfoSchema(),
      ...CurrencySelect.schema(),
    },
  };
};

export default currencySelectBuilder;
