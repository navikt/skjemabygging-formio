import { createDigitalNoLoginAttachmentPanelForm } from '../shared/createDigitalNoLoginAttachmentPanelForm';

const attachmentsPageDigitalNoLoginAttachmentPanelForm = () =>
  createDigitalNoLoginAttachmentPanelForm({
    title: 'Digital no login with attachment panel',
    path: 'attachmentspagedigitalnologinattachmentpanel',
    useYourInformationComponent: true,
  });

const attachmentsPageDigitalNoLoginAttachmentPanelTranslations = () => undefined;

export { attachmentsPageDigitalNoLoginAttachmentPanelForm, attachmentsPageDigitalNoLoginAttachmentPanelTranslations };
