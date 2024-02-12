import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormTabs from '../../base/editForm/editFormTabs';

const maalgruppeForm = () => {
  const { api, conditional, createTabs, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    api([
      editFormApi.key(),
    ]),
    data([
      editFormData.calculateValue()
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default maalgruppeForm;
