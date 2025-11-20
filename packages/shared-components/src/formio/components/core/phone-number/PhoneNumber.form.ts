import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormShowAreaCode from '../../base/editForm/data/editFormShowAreaCode';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const phoneNumberForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
      editFormShowAreaCode(),
    ]),
    validation([
      editFormValidation.required(),
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

export default phoneNumberForm;
