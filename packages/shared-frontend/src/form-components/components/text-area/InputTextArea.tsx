import TextArea from '../../../components/text-area/TextArea';
import { TextAreaDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputTextArea = ({ component, submissionPath }: InputComponentProps<TextAreaDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
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
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputTextArea;
