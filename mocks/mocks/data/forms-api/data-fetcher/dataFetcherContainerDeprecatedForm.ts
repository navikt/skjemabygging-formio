import {
  alert,
  attachment,
  container,
  dataFetcher,
  htmlElement,
  identity,
  panel,
  yourInformation,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const dataFetcherContainerDeprecatedForm = () =>
  form({
    title: 'DataFetcher i container',
    formNumber: 'datafetchercontainer',
    path: 'datafetchercontainer',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          yourInformation({
            key: 'dineOpplysninger',
            hidden: true,
            clearOnHide: false,
            components: [
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
                hidden: true,
                clearOnHide: false,
                validate: { required: false },
              }),
            ],
          }),
          htmlElement({
            content: '<p>Dette er en søknad for testing</p>',
            key: 'veiledningstekst',
            textDisplay: 'form',
          }),
        ],
      }),
      panel({
        key: 'aktivitetsoversikt',
        title: 'Velg aktivitet',
        components: [
          container({
            hideLabel: true,
            key: 'container',
            label: 'Beholder',
            components: [
              dataFetcher({
                key: 'aktiviteter',
                label: 'Aktivitetsvelger',
              }),
            ],
          }),
          alert({
            content: '<p>Aktiviteter er hentet</p>',
            customConditional: "show = utils.dataFetcher('container.aktiviteter', submission).success",
            key: 'alertstripe',
            textDisplay: 'form',
          }),
          alert({
            alerttype: 'error',
            content: '<p>Kall for å hente aktiviteter feilet</p>',
            customConditional: "show = utils.dataFetcher('container.aktiviteter', submission).failure",
            key: 'alertstripe1',
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
    properties: formProperties({ formNumber: 'datafetchercontainer', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const dataFetcherContainerDeprecatedTranslations = () =>
  getMockTranslationsFromForm(dataFetcherContainerDeprecatedForm());

export { dataFetcherContainerDeprecatedForm, dataFetcherContainerDeprecatedTranslations };
