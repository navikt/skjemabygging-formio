import { createLegacyNoLoginForm } from '../shared/createLegacyNoLoginForm';

const umamiNologinForm = () =>
  createLegacyNoLoginForm({
    title: 'Uinnlogget søknad',
    path: 'umaminologin',
  });

const umamiNologinTranslations = () => undefined;

export { umamiNologinForm, umamiNologinTranslations };
