import { RadioPanelDefinition } from '../../component-types';
import { InputComponentProps } from '../../inputComponentUtils';
import InputRadio from '../radio/InputRadio';

const InputRadioPanel = (props: InputComponentProps<RadioPanelDefinition>) => <InputRadio {...props} />;

export default InputRadioPanel;
