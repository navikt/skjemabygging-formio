import { createLegacyNoLoginForm } from '../shared/createLegacyNoLoginForm';

const introPageDigitalNoLoginDeadlineForm = () =>
  createLegacyNoLoginForm({
    title: 'Uinnlogget søknad',
    path: 'intropagedigitalnologindeadline',
  });

const introPageDigitalNoLoginDeadlineTranslations = () => undefined;

export { introPageDigitalNoLoginDeadlineForm, introPageDigitalNoLoginDeadlineTranslations };
