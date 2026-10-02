import CountrySelect from '../../../components/country-select/CountrySelect';
import { CountrySelectDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputCountrySelect = ({ component, submissionPath }: InputComponentProps<CountrySelectDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <CountrySelect
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      ignoreOptions={component.ignoreNorway ? ['NO'] : undefined}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputCountrySelect;
