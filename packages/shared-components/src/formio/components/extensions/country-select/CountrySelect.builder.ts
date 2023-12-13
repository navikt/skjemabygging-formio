import { defaultBuilderSchema } from '../../base/builderHelper';
import CountrySelect from './CountrySelect';

const countrySelectBuilder = () => {
  const schema = CountrySelect.schema();
  return {
    title: 'Landvelger',
    group: 'person',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default countrySelectBuilder;
