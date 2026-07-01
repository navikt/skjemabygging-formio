import { alert, attachment, dataFetcher, htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const dataFetcherDeprecatedForm = () =>
  form({
    title: 'Testskjema for datafetcher komponent',
    formNumber: 'TS 12-34.56',
    path: 'datafetchertest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: '<p>Et skjema for å teste vår datafetcher</p>',
            key: 'veiledningstekst',
            textDisplay: 'form',
          }),
        ],
      }),
      panel({
        key: 'arbeidsrettetaktivitet',
        title: 'Arbeidsrettet aktivitet',
        components: [
          dataFetcher({
            key: 'aktivitetsvelger',
            label: 'Aktivitetsvelger',
          }),
          alert({
            alerttype: 'error',
            content: '<p>Kall for å hente aktiviteter feilet</p>',
            customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).failure",
            key: 'alertstripe1',
            textDisplay: 'form',
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
            content: '<p>Du har valgt aktivitet med type TILTAK</p>',
            customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).selected({type: 'TILTAK'})",
            key: 'alertstripe2',
            textDisplay: 'form',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
                showDeadline: false,
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              harIkke: {
                additionalDocumentation: {},
                enabled: false,
              },
              andre: {
                additionalDocumentation: {},
                enabled: false,
              },
              nav: {
                additionalDocumentation: {},
                enabled: false,
              },
            },
            customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).fetchDisabled;",
            description: '<p><span>Hvis du har like utgifter hver måned, holder det å legge ved én faktura.</span></p>',
            key: 'fakturaFraSfo',
            label: 'Faktura fra SFO',
          }),
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              nei: {
                enabled: true,
              },
              leggerVedNaa: {
                enabled: true,
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'TS 12-34.56', submissionTypes: ['DIGITAL', 'PAPER'] }),
  });

const dataFetcherDeprecatedTranslations = () => getMockTranslationsFromForm(dataFetcherDeprecatedForm());

export { dataFetcherDeprecatedForm, dataFetcherDeprecatedTranslations };
