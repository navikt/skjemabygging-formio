import {
  address,
  addressValidity,
  alert,
  attachment,
  container,
  dataGrid,
  firstName,
  htmlElement,
  identity,
  panel,
  radio,
  surname,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const conditionalRenderingDatagridForm = () =>
  form({
    title: 'Container i datagrid',
    formNumber: 'TST 19-81.06',
    path: 'conditionaldatagrid',
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
        key: 'informasjon',
        title: 'Informasjon',
        components: [
          dataGrid({
            key: 'kjaeledyr',
            label: 'Kjæledyr',
            components: [
              textField({
                key: 'navn',
                label: 'Navn',
              }),
              container({
                hideLabel: true,
                key: 'egenskaper',
                label: 'Egenskaper',
                components: [
                  textField({
                    key: 'alder',
                    label: 'Alder',
                  }),
                  textField({
                    conditional: {
                      show: true,
                      when: 'kjaeledyr.egenskaper.alder',
                      eq: '5',
                    },
                    key: 'oppgiForsikringsselskapNarAlderEr5Ar',
                    label: 'Oppgi forsikringsselskap når alder er 5 år',
                  }),
                  radio({
                    conditional: {
                      show: false,
                      when: '',
                      eq: '',
                    },
                    customConditional: 'show = row.alder ? parseInt(row.alder) >= 10 : false;',
                    key: 'brukerDyretMedisiner',
                    label: 'Bruker dyret medisiner?',
                    values: [
                      { label: 'Ja', value: 'ja' },
                      { label: 'Nei', value: 'nei' },
                    ],
                  }),
                ],
              }),
              radio({
                conditional: {
                  show: true,
                  when: 'kjaeledyr.egenskaper.alder',
                  eq: '0',
                },
                key: 'harDetBlittGjennomfortOyelysing',
                label: 'Har det blitt gjennomført øyelysing?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              alert({
                alerttype: 'warning',
                content: '<p>Et dyr som er eldre enn 20 år kan ikke forsikres</p>',
                customConditional: 'show = row.egenskaper.alder ? parseInt(row.egenskaper.alder) >= 20 : false;',
                key: 'alertstripeForHoyAlder',
                textDisplay: 'form',
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
    properties: formProperties({ formNumber: 'TST 19-81.06', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const conditionalRenderingDatagridTranslations = () => getMockTranslationsFromForm(conditionalRenderingDatagridForm());

export { conditionalRenderingDatagridForm, conditionalRenderingDatagridTranslations };
