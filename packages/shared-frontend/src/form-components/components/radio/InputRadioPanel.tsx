import { RadioPanelDefinition } from '../../component-types';
import { InputComponentProps } from '../../inputComponentRegistryUtils';
import InputRadio from '../radio/InputRadio';

const InputRadioPanel = (props: InputComponentProps<RadioPanelDefinition>) => <InputRadio {...props} />;

export default InputRadioPanel;
