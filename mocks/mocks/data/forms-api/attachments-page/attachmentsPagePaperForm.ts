import { createLegacyNoLoginForm } from '../shared/createLegacyNoLoginForm';

const attachmentsPagePaperForm = () =>
  createLegacyNoLoginForm({
    title: 'Uinnlogget søknad',
    path: 'attachmentspagepaper',
  });

const attachmentsPagePaperTranslations = () => undefined;

export { attachmentsPagePaperForm, attachmentsPagePaperTranslations };
