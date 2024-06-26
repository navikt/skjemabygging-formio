import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormDateValidation from '../../base/editForm/validation/date';

const monthPickerForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  //prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
    ]),
    validation([
      editFormValidation.required(),
      editFormValidation.minYear(),
      editFormValidation.maxYear(),
      editFormDateValidation.limitRelativelyToToday('year'),

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

export default monthPickerForm;
