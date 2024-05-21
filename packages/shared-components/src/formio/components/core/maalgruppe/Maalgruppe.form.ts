import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormTabs from '../../base/editForm/editFormTabs';

const maalgruppeForm = () => {
  const { conditional, createTabs, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    data([
      editFormData.calculateValue(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default maalgruppeForm;
