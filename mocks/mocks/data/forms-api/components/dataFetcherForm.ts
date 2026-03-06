import { dataFetcher, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const dataFetcherTestForm = () => {
  const formNumber = 'datafetcher';

  return form({
    title: 'DataFetcher component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          dataFetcher({ key: 'aktivitet1', dataFetcherSourceId: 'activities' }),
          dataFetcher({
            key: 'aktivitet2',
            dataFetcherSourceId: 'activities',
            label: 'Aktivitetsvelger med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
          dataFetcher({
            key: 'aktivitet3',
            dataFetcherSourceId: 'activities',
            label: 'Aktivitetsvelger med annet',
            showOther: true,
          }),
        ],
      }),
    ],
  });
};

const dataFetcherTranslations = () => getMockTranslationsFromForm(dataFetcherTestForm());

export { dataFetcherTestForm, dataFetcherTranslations };
