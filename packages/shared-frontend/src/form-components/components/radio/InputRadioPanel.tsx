import { InputComponentProps } from '../../inputComponentRegistryUtils';
import InputAttachment from '../attachment/InputAttachment';
import InputRadio from '../radio/InputRadio';

const InputRadioPanel = (props: InputComponentProps) =>
  props.component.attachmentValues ? <InputAttachment {...props} /> : <InputRadio {...props} />;

export default InputRadioPanel;
