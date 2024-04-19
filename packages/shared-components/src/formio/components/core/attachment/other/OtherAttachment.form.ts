import editFormApi from '../../../base/editForm/api';
import editFormConditional from '../../../base/editForm/conditional';
import editFormData from '../../../base/editForm/data';
import editFormDisplay from '../../../base/editForm/display';
import editFormTabs from '../../../base/editForm/editFormTabs';

const otherAttachmentForm = () => {
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
      editFormApi.property({
        label: 'Vedleggstittel',
        key: 'vedleggstittel',
        required: false,
        description: 'Er påkrevd for publisering av skjemaet',
        readOnly: true,
      }),
      // Vedleggskode is required to publish, but validation happens before publishing.
      editFormApi.property({
        label: 'Vedleggskode',
        key: 'vedleggskode',
        required: false,
        description: 'Er påkrevd for publisering av skjemaet',
        readOnly: true,
      }),
      editFormApi.property({
        label: 'Vedleggskjema',
        key: 'vedleggskjema',
        required: false,
        description:
          'Hvis vedleggskjema er oppgitt vises lenke til utfylling av skjemaet, på opplastningssiden for digital innsending. Eksempel på format "nav100750"',
      }),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default otherAttachmentForm;
