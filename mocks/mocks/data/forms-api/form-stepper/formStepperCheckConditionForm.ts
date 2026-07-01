import {
  address,
  addressValidity,
  alert,
  attachment,
  container,
  dataFetcher,
  datePicker,
  firstName,
  htmlElement,
  identity,
  number,
  panel,
  surname,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const formStepperCheckConditionForm = () =>
  form({
    title: 'Tester utils checkCondition',
    formNumber: 'TST 19-81.05',
    path: 'formsteppercheckcondition',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          htmlElement({
            content: 'Her skal det stå en veiledningstekst for søknaden',
            key: 'veiledningstekst',
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
        key: 'diversedata',
        title: 'Diverse data',
        components: [
          datePicker({
            key: 'startdato',
            label: 'Startdato (dd.mm.åååå)',
          }),
          dataFetcher({
            dataFetcherSourceId: 'activities',
            key: 'aktivitetsvelger',
            label: 'Aktivitetsvelger',
          }),
        ],
      }),
      panel({
        key: 'page5',
        title: 'Viktige data',
        customConditional: "show = utils.isBornBeforeYear(2000, 'startdato', submission)",
        components: [
          textField({
            key: 'hemmeligKodeord',
            label: 'Hemmelig kodeord',
          }),
        ],
      }),
      panel({
        key: 'page6',
        title: 'Mer om aktiviteter',
        customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).success;",
        components: [
          number({
            key: 'hvorMangeAktiviteterErAktuelle',
            label: 'Hvor mange aktiviteter er aktuelle?',
          }),
        ],
      }),
      panel({
        key: 'world',
        title: 'World',
        customConditional: "show = _.get(data, 'hemmeligKodeord') === 'hello'",
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
                enabled: false,
                additionalDocumentation: {},
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
            customConditional: "show = utils.isBornBeforeYear(2000, 'startdato', submission)",
            key: 'kursbevis',
            label: 'Kursbevis',
          }),
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
            customConditional: "show = utils.dataFetcher('aktivitetsvelger', submission).selected({type: 'HELSE'});",
            key: 'uttalelseFraLege',
            label: 'Uttalelse fra lege',
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
    properties: formProperties({ formNumber: 'TST 19-81.05', submissionTypes: ['PAPER', 'DIGITAL'] }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const formStepperCheckConditionTranslations = () => getMockTranslationsFromForm(formStepperCheckConditionForm());

export { formStepperCheckConditionForm, formStepperCheckConditionTranslations };
