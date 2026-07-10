import TextArea from '../../../components/text-area/TextArea';
import { InputComponentProps, isRequired, resolveSubmissionPath } from '../../inputComponentRegistryUtils';

const InputTextArea = ({ component, submissionPath }: InputComponentProps) => (
  <TextArea
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    maxLength={component.validate?.maxLength}
  />
);

export default InputTextArea;
