import CountrySelect from '../../../components/country-select/CountrySelect';
import { CountrySelectDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCountrySelect = ({ component, submissionPath }: InputComponentProps<CountrySelectDefinition>) => (
  <FormGroup>
    <CountrySelect
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      ignoreOptions={component.ignoreNorway ? ['NO'] : undefined}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputCountrySelect;
