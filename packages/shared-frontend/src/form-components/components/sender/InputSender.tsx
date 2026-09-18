import Sender from '../../../components/sender/Sender';
import { getPrefilledSender, SenderPrefillValue } from '../../../components/sender/senderValidation';
import { SenderDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const isSenderPrefillValue = (value: unknown): value is SenderPrefillValue =>
  typeof value === 'object' && value !== null;

const InputSender = ({ component, submissionPath }: InputComponentProps<SenderDefinition>) => {
  const prefillValue = isSenderPrefillValue(component.prefillValue) ? component.prefillValue : undefined;

  return (
    <Sender
      statePath={resolveSubmissionPath(component, submissionPath)}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly || getPrefilledSender(component.senderRole ?? 'person', prefillValue) !== undefined}
      readMore={resolveReadMore(component)}
      senderRole={component.senderRole}
      customLabels={component.customLabels}
      descriptions={component.descriptions}
    />
  );
};

export default InputSender;
