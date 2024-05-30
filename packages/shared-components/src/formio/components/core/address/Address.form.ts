import editFormConditional from '../../base/editForm/conditional';
import editFormTabs from '../../base/editForm/editFormTabs';

const addressForm = () => {
  const { conditional, createTabs } = editFormTabs;

  // prettier-ignore
  return createTabs(
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default addressForm;
