import Sender, { SenderPrefillValue } from '../../../components/sender/Sender';
import { SenderDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const isSenderPrefillValue = (value: unknown): value is SenderPrefillValue =>
  typeof value === 'object' && value !== null;

const InputSender = ({ component, submissionPath }: InputComponentProps<SenderDefinition>) => {
  const prefillValue = isSenderPrefillValue(component.prefillValue) ? component.prefillValue : undefined;

  return (
    <FormGroup>
      <Sender
        statePath={resolveSubmissionPath(component, submissionPath)}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        senderRole={component.senderRole}
        customLabels={component.customLabels}
        descriptions={component.descriptions}
        prefillValue={prefillValue}
      />
    </FormGroup>
  );
};

export default InputSender;
