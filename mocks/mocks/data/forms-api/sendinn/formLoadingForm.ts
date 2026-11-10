import { attachment, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const sendinnFormLoadingForm = () =>
  form({
    title: 'Sendinn form loading',
    formNumber: 'NAV 12-34.56',
    path: 'nav123456',
    status: 'published',
    publishedLanguages: ['en'],
    components: [
      panel({
        title: 'Application questions',
        components: [textField({ key: 'applicationOnly', label: 'Application only question' })],
      }),
      panel({
        title: 'Documents',
        components: [
          attachment({
            key: 'firstDocument',
            label: 'First document',
            properties: { vedleggskode: 'N1', vedleggstittel: 'First document archive title' },
          }),
          attachment({
            key: 'secondDocument',
            label: 'Second document',
            properties: { vedleggskode: 'N2', vedleggstittel: 'Second document archive title' },
          }),
        ],
      }),
    ],
  });

const sendinnFormLoadingTranslations = () => getMockTranslationsFromForm(sendinnFormLoadingForm());

export { sendinnFormLoadingForm, sendinnFormLoadingTranslations };
