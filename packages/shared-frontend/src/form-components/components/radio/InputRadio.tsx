import RadioGroup from '../../../components/radio-group/RadioGroup';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputRadio = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <RadioGroup
      statePath={resolveSubmissionPath(component, submissionPath)}
      legend={component.label}
      description={component.description}
      values={getValues(component)}
      defaultValue={typeof component.defaultValue === 'string' ? component.defaultValue : undefined}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputRadio;
