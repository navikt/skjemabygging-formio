import { alert, dataFetcher, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const dataFetcherAnnetDeprecatedForm = () =>
  form({
    title: 'Data fetcher annet test',
    formNumber: '123456',
    path: 'datafetcherannettest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          dataFetcher({
            key: 'aktivitetsvelger',
            label: 'Aktivitetsvelger',
            showOther: true,
          }),
          alert({
            alerttype: 'warning',
            content: '<p>Ingen aktiviteter ble hentet</p>',
            customConditional: `var dataFetcher = utils.dataFetcher('aktivitetsvelger', submission);
show = dataFetcher.fetchDisabled || dataFetcher.empty;`,
            key: 'alertstripe',
            textDisplay: 'form',
          }),
          alert({
            alerttype: 'warning',
            content: '<p>Du har valgt annen aktivitet</p>',
            customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).selected('OTHER');",
            key: 'alertstripe',
            textDisplay: 'form',
          }),
          textField({
            additionalDescriptionLabel: 'dfdf',
            additionalDescriptionText: '<p>heihei</p>',
            customConditional:
              'show = submission && submission.metadata && submission.metadata.dataFetcher && submission.metadata.dataFetcher.dataFetcher && submission.metadata.dataFetcher.dataFetcher.data && submission.metadata.dataFetcher.dataFetcher.data.length === 3',
            key: 'tekstfelt',
            label: 'Tekstfelt',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: '123456', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const dataFetcherAnnetDeprecatedTranslations = () => getMockTranslationsFromForm(dataFetcherAnnetDeprecatedForm());

export { dataFetcherAnnetDeprecatedForm, dataFetcherAnnetDeprecatedTranslations };
