import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';

const accordionForm = () => {
  const { api, conditional, createTabs, display, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.titleSize({values: ['XS', 'S'], defaultValue: "S"})
    ]),
    api([
      editFormApi.key(),
    ]),
    data([
      editFormData.accordionGrid(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default accordionForm;
