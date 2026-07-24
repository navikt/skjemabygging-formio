import CountrySelect from '../../../components/country-select/CountrySelect';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCountrySelect = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <CountrySelect
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      ignoreOptions={component.ignoreNorway ? ['NO'] : undefined}
      required={isRequired(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputCountrySelect;
