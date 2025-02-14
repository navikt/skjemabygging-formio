import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormAltText from './editForm/editFormAltText';
import editFormImage from './editForm/editFormImage';
import editFormWidthPercent from './editForm/editFormWidthPercent';

const imageForm = () => {
  const { api, conditional, createTabs, display } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormImage(),
      editFormAltText(),
      editFormDisplay.description(),
      editFormWidthPercent(),
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

export default imageForm;
