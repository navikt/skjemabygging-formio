import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const selectBoxesForm = (componentType: string) => {
  const { api, conditional, createTabs, data, display, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
    ]),
    data([
      editFormData.values({withDescription: true, minLength: 2}),
      editFormData.defaultValue(componentType),
    ]),
    validation([
      editFormValidation.required(),
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

export default selectBoxesForm;
