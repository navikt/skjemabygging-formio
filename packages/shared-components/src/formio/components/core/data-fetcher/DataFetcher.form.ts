import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormQueryParams from './edit-form/editFormQueryParams';
import editFormShowAnnet from './edit-form/editFormShowAnnet';

const dataFetcherForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormShowAnnet(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
    ]),
    validation([
      editFormValidation.required(),
      editFormValidation.customValidation(),
      editFormValidation.customError(),
    ]),
    api([
      editFormApi.key(),
      editFormQueryParams(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default dataFetcherForm;
