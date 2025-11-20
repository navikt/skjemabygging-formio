import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormDateValidation from '../../base/editForm/validation/date';

const datePickerForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  //prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
      editFormDisplay.showYearPicker(),
    ]),
    validation([
      editFormValidation.required(),
      editFormDateValidation.fromDate(),
      editFormDateValidation.limitRelativelyToToday('day'),
      editFormDateValidation.limitToEarliestLatest(),
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

export default datePickerForm;
