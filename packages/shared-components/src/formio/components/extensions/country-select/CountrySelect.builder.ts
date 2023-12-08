import { defaultBuilderInfoSchema } from '../../base/builderHelper';
import CountrySelect from './CountrySelect';

const countrySelectBuilder = () => {
  return {
    title: 'Landvelger',
    key: 'landvelger',
    group: 'person',
    icon: 'home',
    schema: {
      ...defaultBuilderInfoSchema(),
      ...CountrySelect.schema(),
    },
  };
};

export default countrySelectBuilder;
