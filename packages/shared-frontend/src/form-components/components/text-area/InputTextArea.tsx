import TextArea from '../../../components/text-area/TextArea';
import { TextAreaDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputTextArea = ({ component, submissionPath }: InputComponentProps<TextAreaDefinition>) => (
  <FormGroup>
    <TextArea
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      maxLength={component.validate?.maxLength}
      readMore={resolveReadMore(component)}
    />
  </FormGroup>
);

export default InputTextArea;
