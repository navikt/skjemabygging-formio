import CountrySelect from '../../../components/country-select/CountrySelect';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputCountrySelect = ({ component, submissionPath }: InputComponentProps) => (
  <CountrySelect
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputCountrySelect;
