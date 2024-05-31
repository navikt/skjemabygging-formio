import editFormApi from '../../../base/editForm/api';
import editFormConditional from '../../../base/editForm/conditional';
import editFormData from '../../../base/editForm/data';
import editFormDisplay from '../../../base/editForm/display';
import editFormTabs from '../../../base/editForm/editFormTabs';

const defaultAttachmentForm = () => {
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
      // Vedleggstittel is read-only when attachmentType is "other".
      editFormApi.vedleggskode({
        customConditional: 'show = data.attachmentType === "default"',
      }),
      editFormApi.vedleggstittel({
        customConditional: 'show = data.attachmentType === "other"',
        readOnly: true,
      }),

      // Vedleggskode is required to publish, but validation happens before publishing.
      // Vedleggskode is read-only when attachmentType is "other".
      editFormApi.vedleggskode({
        customConditional: 'show = data.attachmentType === "default"',
      }),
      editFormApi.vedleggskode({
        customConditional: 'show = data.attachmentType === "other"',
        readOnly: true,
      }),

      // Vedleggskjema is only shown when attachmentType is "default".
      editFormApi.property({
        label: 'Vedleggskjema',
        key: 'vedleggskjema',
        required: false,
        description:
          'Hvis vedleggskjema er oppgitt vises lenke til utfylling av skjemaet, på opplastningssiden for digital innsending. Eksempel på format "nav100750"',
        customConditional: 'show = data.attachmentType === "default"',
        }),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default defaultAttachmentForm;
