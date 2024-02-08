import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';

const attachmentForm = () => {
  const { api, conditional, createTabs, display, validation, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    display([
      editFormDisplay.label(),
      editFormDisplay.description(),
      editFormDisplay.additionalDescription(),
    ]),
    data([
      ...editFormData.attachment(),
    ]),
    validation([
      editFormValidation.required(),
    ]),
    api([
      editFormApi.key(),
      editFormApi.property('Vedleggstittel', 'vedleggstittel', true),
      editFormApi.property('Vedleggskode', 'vedleggskode', true),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default attachmentForm;
