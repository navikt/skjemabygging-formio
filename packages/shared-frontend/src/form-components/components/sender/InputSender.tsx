import Sender from '../../../components/sender/Sender';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputSender = ({ component, submissionPath }: InputComponentProps) => (
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
);

export default InputSender;
