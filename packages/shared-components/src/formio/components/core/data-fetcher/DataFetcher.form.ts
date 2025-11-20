import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormDataSource from './edit-form/editFormDataSource';
import editFormQueryParams from './edit-form/editFormQueryParams';
import editFormShowOther from './edit-form/editFormShowOther';

const dataFetcherForm = () => {
  const { api, conditional, createTabs, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormShowOther(),
      editFormDataSource(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
    ]),
    validation([
      editFormValidation.required(),
      editFormValidation.customValidation(),
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
