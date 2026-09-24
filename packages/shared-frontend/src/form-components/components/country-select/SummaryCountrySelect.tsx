import { CountrySelectDefinition } from '../../component-types';
import DefaultSelectAnswer from '../../shared/SummaryDefaultSelectAnswer';
import { FormComponentProps } from '../../types';

const SummaryCountrySelect = (props: FormComponentProps<CountrySelectDefinition>) => {
  return <DefaultSelectAnswer {...props} />;
};

export default SummaryCountrySelect;
