import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import Select from '../../../components/select/Select';
import { SelectDefinition } from '../../component-types';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSelectType,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const isComponentValue = (value: unknown): value is ComponentValue =>
  typeof value === 'object' && value !== null && 'value' in value && 'label' in value;

const InputSelect = ({ component, submissionPath }: InputComponentProps<SelectDefinition>) => (
  <FormGroup>
    <Select
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      values={getValues(component)}
      fieldSize={resolveFieldSize(component)}
      defaultValue={
        typeof component.defaultValue === 'string' || isComponentValue(component.defaultValue)
          ? component.defaultValue
          : undefined
      }
      valueType="option"
      required={isRequired(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      selectType={resolveSelectType(component)}
    />
  </FormGroup>
);

export default InputSelect;
