import editFormApi from '../base/editForm/api';
import editFormConditional from '../base/editForm/conditional';
import editFormData from '../base/editForm/data';
import editFormDisplay from '../base/editForm/display';
import editFormTabs from '../base/editForm/editFormTabs';
import editFormValidation from '../base/editForm/validation';

const textFieldForm = () => {
  const { api, conditional, createTabs, data, display, validation } = editFormTabs;
  const { additionalDescription, description, fieldSize, label, autoComplete, spellCheck } = editFormDisplay;
  const { clearOnHide } = editFormData;
  const { customError, customValidation, maxLength, minLength, required } = editFormValidation;
  const { key } = editFormApi;
  const { advancedConditional, simpleConditional } = editFormConditional;

  return createTabs(
    display([label(), fieldSize(), description(), additionalDescription(), autoComplete(), spellCheck()]),
    data([clearOnHide()]),
    validation([required(), minLength(), maxLength(), customValidation(), customError()]),
    api([key()]),
    conditional([simpleConditional(), advancedConditional()]),
  );
};

export default textFieldForm;
