import editFormApi from '../base/editForm/api';
import editFormConditional from '../base/editForm/conditional';
import editFormData from '../base/editForm/data';
import editFormDisplay from '../base/editForm/display';
import editFormTabs from '../base/editForm/editFormTabs';
import editFormValidation from '../base/editForm/validation';

const navSelectForm = () => {
  const { api, conditional, createTabs, data, display, validation } = editFormTabs;

  return createTabs(
    display([editFormDisplay.label(), editFormDisplay.fieldSize(), editFormDisplay.description()]),
    data([editFormData.defaultValue(), editFormData.dataValues(), editFormData.clearOnHide()]),
    validation([
      editFormValidation.required(),
      editFormValidation.customValidation(),
      editFormValidation.customError(),
    ]),
    api([editFormApi.key()]),
    conditional([editFormConditional.simpleConditional(), editFormConditional.advancedConditional()]),
  );
};

export default navSelectForm;
