import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const textFieldForm = () => {
  const { api, conditional, createTabs, display, validation, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.fieldSize(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
      editFormDisplay.autoComplete(),
      editFormDisplay.spellCheck(),
    ]),
    data([
      editFormData.calculateValue(),
    ]),
    validation([
      editFormValidation.required(),
      editFormValidation.digitsOnly(),
      editFormValidation.minLength(),
      editFormValidation.maxLength(),
      editFormValidation.customValidation(),
    ]),
    api([
      editFormApi.key(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default textFieldForm;
