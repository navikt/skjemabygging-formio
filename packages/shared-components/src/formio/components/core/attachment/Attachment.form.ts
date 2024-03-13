import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormDisplay from '../../base/editForm/display';
import editFormTabs from '../../base/editForm/editFormTabs';

const attachmentForm = () => {
  const { api, conditional, createTabs, display, data } = editFormTabs;

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
    api([
      editFormApi.key(),
      // Vedleggstittel is required to publish, but validation happens before publishing.
      editFormApi.property('Vedleggstittel', 'vedleggstittel', false,
        'Er påkrevd for publisering av skjemaet'),
      // Vedleggskode is required to publish, but validation happens before publishing.
      editFormApi.property('Vedleggskode', 'vedleggskode', false,
        'Er påkrevd for publisering av skjemaet'),
      editFormApi.property('Vedleggskjema', 'vedleggskjema', false,
        'Hvis vedleggskjema er oppgitt vises lenke til utfylling av skjemaet, på opplastningssiden for digital innsending. Eksempel på format "nav100750"'),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default attachmentForm;
