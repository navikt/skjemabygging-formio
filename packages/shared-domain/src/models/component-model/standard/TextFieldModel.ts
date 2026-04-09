import { ComponentValidate, InputMode } from '../../form';
import { BaseComponentModel } from '../BaseComponentModel';

interface TextFieldModel extends BaseComponentModel {
  type: 'textField';
  autocomplete?: string;
  inputType?: InputMode;
  spellCheck?: boolean;
  validate?: ComponentValidate;
}

export type { TextFieldModel };
