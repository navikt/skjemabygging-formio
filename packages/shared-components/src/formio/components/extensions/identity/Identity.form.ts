import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormTabs from '../../base/editForm/editFormTabs';

const identityForm = () => {
  const { api, data, conditional, createTabs } = editFormTabs;

  // prettier-ignore
  return createTabs(
    data([
      editFormData.prefillKey({prefillKey: 'sokerIdentifikasjonsnummer'}),
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

export default identityForm;
