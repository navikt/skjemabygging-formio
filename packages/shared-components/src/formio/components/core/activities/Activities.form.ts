import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormTabs from '../../base/editForm/editFormTabs';

const alertForm = () => {
  const { api, conditional, createTabs } = editFormTabs;

  // prettier-ignore
  return createTabs(
    api([
      editFormApi.key(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default alertForm;
