import Sender from '../../../components/sender/Sender';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputSender = ({ component, submissionPath }: InputComponentProps) => (
  <FormGroup>
    <Sender
      statePath={resolveSubmissionPath(component, submissionPath)}
      required={isRequired(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      senderRole={component.senderRole}
      customLabels={component.customLabels}
      descriptions={component.descriptions}
      prefillValue={component.prefillValue}
    />
  </FormGroup>
);

export default InputSender;
