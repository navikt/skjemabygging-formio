import Checkbox from '../../../components/checkbox/Checkbox';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputCheckbox = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <Checkbox
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      defaultValue={typeof component.defaultValue === 'boolean' ? component.defaultValue : undefined}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      showInlineError={!component.validate?.custom}
    />
  </FormGroup>
);

export default InputCheckbox;
