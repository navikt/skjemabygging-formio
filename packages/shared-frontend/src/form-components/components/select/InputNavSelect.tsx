import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import Select from '../../../components/select/Select';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const isComponentValue = (value: unknown): value is ComponentValue =>
  typeof value === 'object' && value !== null && 'value' in value && 'label' in value;

const InputNavSelect = ({ component, submissionPath }: InputComponentProps) => (
  <Select
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    values={getValues(component)}
    defaultValue={
      typeof component.defaultValue === 'string' || isComponentValue(component.defaultValue)
        ? component.defaultValue
        : undefined
    }
    valueType="option"
    required={isRequired(component)}
    readMore={resolveReadMore(component)}
    selectType={resolveSelectType(component)}
  />
);

export default InputNavSelect;
