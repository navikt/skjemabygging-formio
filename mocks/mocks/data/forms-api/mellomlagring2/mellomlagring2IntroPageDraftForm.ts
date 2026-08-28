import formIntroPage from '../../../form-builder/form/formIntroPage';
import { createTestMellomlagringForms } from '../shared/createTestMellomlagringForms';

const formPath = 'mellomlagring2intropagedraft';

const mellomlagring2IntroPageDraftForm = () => ({
  ...createTestMellomlagringForms(formPath).form,
  introPage: formIntroPage({ enabled: true }),
});

const mellomlagring2IntroPageDraftTranslations = () => undefined;

export { mellomlagring2IntroPageDraftForm, mellomlagring2IntroPageDraftTranslations };
