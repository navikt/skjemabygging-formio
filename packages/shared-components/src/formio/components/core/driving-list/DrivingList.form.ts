import editFormConditional from '../../base/editForm/conditional';
import editFormTabs from '../../base/editForm/editFormTabs';

const drivingListForm = () => {
  const { conditional, createTabs } = editFormTabs;

  // prettier-ignore
  return createTabs(
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default drivingListForm;
