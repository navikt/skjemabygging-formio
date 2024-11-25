import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormIgnoreNorway from './editForm/editFormIgnoreNorway';

const countrySelectForm = (componentType: string) => {
  const { api, conditional, createTabs, data, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.fieldSize(),
      editFormDisplay.description(),
    ]),
    data([
      editFormIgnoreNorway(),
      editFormData.defaultValue(componentType),
    ]),
    validation([
      editFormValidation.required(),
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

export default countrySelectForm;
