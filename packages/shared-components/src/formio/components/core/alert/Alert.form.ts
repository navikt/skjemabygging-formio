import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';

const alertForm = () => {
  const { api, conditional, createTabs, display } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.content(),
      editFormDisplay.alertType(),
      editFormDisplay.inline(),
      editFormDisplay.contentToIncludeInPdf(),
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

export default alertForm;
