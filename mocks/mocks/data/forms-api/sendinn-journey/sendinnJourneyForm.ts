import { attachment, container, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const sendinnJourneyForm = () =>
  form({
    title: 'Sendinn journey',
    formNumber: 'NAV test',
    path: 'sendinnjourney',
    status: 'published',
    publishedLanguages: ['en'],
    properties: {
      ...formProperties({ formNumber: 'NAV test', subsequentSubmissionTypes: ['PAPER'] }),
      enhetstyper: ['LOKAL', 'HMS'],
      navUnitDescription: 'Choose the receiving office',
    },
    components: [
      panel({
        title: 'Source documents',
        components: [
          container({
            key: 'nestedSource',
            label: 'Nested source',
            components: [
              attachment({ key: 'evidence', label: 'Evidence document', properties: { vedleggskode: 'N1' } }),
            ],
          }),
          attachment({ key: 'other', label: 'Other document', attachmentType: 'other' }),
        ],
      }),
    ],
  });

const sendinnJourneyTranslations = () => getMockTranslationsFromForm(sendinnJourneyForm());

export { sendinnJourneyForm, sendinnJourneyTranslations };
