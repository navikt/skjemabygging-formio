import { createLegacyNoLoginForm } from '../shared/createLegacyNoLoginForm';

const nologinSubmissionForm = () =>
  createLegacyNoLoginForm({
    title: 'Uinnlogget søknad',
    path: 'nologinsubmission',
  });

const nologinSubmissionTranslations = () => undefined;

export { nologinSubmissionForm, nologinSubmissionTranslations };
