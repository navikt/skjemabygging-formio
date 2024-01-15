import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const textAreaForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.fieldSize(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
      editFormDisplay.rows(),
      editFormDisplay.autoExpand(),
      editFormDisplay.autoComplete(),
      editFormDisplay.spellCheck(),
    ]),
    validation([
      editFormValidation.required(),
      editFormValidation.minLength(),
      editFormValidation.maxLength(),
      editFormValidation.customValidation(),
      editFormValidation.customError(),
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

export default textAreaForm;
