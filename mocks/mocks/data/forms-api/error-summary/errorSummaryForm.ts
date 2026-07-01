import {
  address,
  addressValidity,
  alert,
  attachment,
  container,
  dataGrid,
  firstName,
  formGroup,
  htmlElement,
  identity,
  number,
  panel,
  radio,
  surname,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const errorSummaryForm = () =>
  form({
    title: 'Error summary focus test',
    formNumber: 'TST 01-04.25',
    path: 'errorsummaryfocus',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content:
              '<p>Denne søknaden er opprettet for å teste fokus-håndtering i forbindelse med valideringsfeil</p>',
            key: 'veiledningstekst',
            textDisplay: 'form',
          }),
          firstName({
            key: 'fornavn',
            label: 'Fornavn',
          }),
        ],
      }),
      panel({
        key: 'dineOpplysninger',
        title: 'Dine opplysninger',
        components: [
          container({
            hideLabel: true,
            key: 'dineOpplysninger',
            label: 'Dine opplysninger',
            components: [
              firstName({
                key: 'fornavn',
                label: 'Fornavn',
                prefill: true,
                prefillKey: 'sokerFornavn',
                protectedApiKey: true,
              }),
              surname({
                key: 'etternavn',
                label: 'Etternavn',
                prefill: true,
                prefillKey: 'sokerEtternavn',
                protectedApiKey: true,
              }),
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
              }),
              address({
                customConditional:
                  'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
                key: 'adresse',
                label: 'Adresse',
                prefill: true,
                prefillKey: 'sokerAdresser',
                protectedApiKey: true,
              }),
              addressValidity({
                customConditional:
                  'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
                key: 'adresseVarighet',
                label: 'Adresse varighet',
                protectedApiKey: true,
              }),
              alert({
                content:
                  '<p>Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer">sjekke og endre din folkeregistrerte adresse på Skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
                customConditional: 'show = row.identitet.harDuFodselsnummer === "ja"',
                key: 'alertstripe',
              }),
              alert({
                content:
                  '<p>Adressen er hentet fra Folkeregisteret. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer"> endre adressen på Skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
                customConditional: 'show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer',
                key: 'alertstripePrefill',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'tv',
        title: 'TV',
        components: [
          dataGrid({
            key: 'serierJegHarSett',
            label: 'Serier jeg har sett',
            components: [
              textField({
                key: 'serietittel',
                label: 'Serietittel',
              }),
              radio({
                key: 'antallStjerner',
                label: 'Antall stjerner',
                values: [
                  { label: '*', value: 'en' },
                  { label: '**', value: 'to' },
                  { label: '***', value: 'tre' },
                  { label: '****', value: 'fire' },
                  { label: '*****', value: 'fem' },
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'brukerundersokelse',
        title: 'Brukerundersøkelse',
        components: [
          formGroup({
            key: 'skjermbruk',
            label: 'Skjemagruppe',
            legend: 'Skjermbruk',
            components: [
              number({
                key: 'hvorMangeTimerPerDognBrukerDuPaSkjerm',
                label: 'Hvor mange timer per døgn bruker du på skjerm?',
              }),
              radio({
                customConditional:
                  'show = data.hvorMangeTimerPerDognBrukerDuPaSkjerm && data.hvorMangeTimerPerDognBrukerDuPaSkjerm !== 0',
                key: 'onskerDuABrukeMindreTidPaSkjerm',
                label: 'Ønsker du å bruke mindre tid på skjerm?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                  { label: 'Vet ikke', value: 'vetIkke' },
                ],
              }),
            ],
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
              nav: {
                enabled: false,
                additionalDocumentation: {},
              },
              andre: {
                enabled: false,
                additionalDocumentation: {},
              },
              harIkke: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              ettersender: {
                enabled: true,
                showDeadline: false,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: false,
                },
              },
            },
            key: 'forerkort',
            label: 'Førerkort',
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
    properties: formProperties({ formNumber: 'TST 01-04.25', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const errorSummaryTranslations = () => getMockTranslationsFromForm(errorSummaryForm());

export { errorSummaryForm, errorSummaryTranslations };
