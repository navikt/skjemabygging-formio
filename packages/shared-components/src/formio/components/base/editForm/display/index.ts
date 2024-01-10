import editFormAddAnother from './editFormAddAnother';
import editFormAdditionalDescription from './editFormAdditionalDescription';
import editFormAlertType from './editFormAlertType';
import editFormAutoComplete from './editFormAutoComplete';
import editFormAutoExpand from './editFormAutoExpand';
import editFormButtonText from './editFormButtonText';
import editFormContent from './editFormContent';
import editFormContentToIncludeInPdf from './editFormContentToIncludeInPdf';
import editFormDescription from './editFormDescription';
import editFormDisabled from './editFormDisabled';
import editFormFieldSizeField from './editFormFieldSize';
import editFormHideLabel from './editFormHideLabel';
import editFormInline from './editFormIsInline';
import editFormLabel from './editFormLabel';
import editFormRemoveAnother from './editFormRemoveAnother';
import editFormRows from './editFormRows';
import editFormSpellCheck from './editFormSpellCheck';

const editFormDisplay = {
  additionalDescription: editFormAdditionalDescription,
  autoComplete: editFormAutoComplete,
  description: editFormDescription,
  disabled: editFormDisabled,
  fieldSize: editFormFieldSizeField,
  label: editFormLabel,
  spellCheck: editFormSpellCheck,
  hideLabel: editFormHideLabel,
  autoExpand: editFormAutoExpand,
  rows: editFormRows,
  buttonText: editFormButtonText,
  alertType: editFormAlertType,
  contentToIncludeInPdf: editFormContentToIncludeInPdf,
  content: editFormContent,
  inline: editFormInline,
  addAnother: editFormAddAnother,
  removeAnother: editFormRemoveAnother,
};

export default editFormDisplay;
