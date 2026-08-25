import TextArea from '../../../components/text-area/TextArea';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputTextArea = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <TextArea
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      readOnly={component.readOnly}
      maxLength={component.validate?.maxLength}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputTextArea;
