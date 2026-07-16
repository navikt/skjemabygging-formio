import Checkbox from '../../../components/checkbox/Checkbox';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputCheckbox = ({ component, submissionPath }: InputComponentProps) => (
  <Checkbox
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    defaultValue={typeof component.defaultValue === 'boolean' ? component.defaultValue : undefined}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
    showInlineError={!component.validate?.custom}
  />
);

export default InputCheckbox;
