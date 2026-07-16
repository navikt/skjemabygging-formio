import RadioGroup from '../../../components/radio-group/RadioGroup';
import {
  getValues,
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputRadio = ({ component, submissionPath }: InputComponentProps) => (
  <RadioGroup
    statePath={resolveSubmissionPath(component, submissionPath)}
    legend={component.label}
    description={component.description}
    values={getValues(component)}
    defaultValue={typeof component.defaultValue === 'string' ? component.defaultValue : undefined}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputRadio;
