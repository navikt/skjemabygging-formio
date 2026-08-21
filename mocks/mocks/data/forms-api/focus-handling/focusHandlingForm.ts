import { alert, dataGrid, htmlElement, panel, radio, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const focusHandlingForm = () =>
  form({
    title: 'Test datagrid with conditional',
    formNumber: 'datagridconditional',
    path: 'datagridconditional',
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
        key: 'barnSomSoknadenGjelderFor',
        title: 'Barn som søknaden gjelder for',
        components: [
          dataGrid({
            addAnother: 'Legg til et barn til',
            key: 'opplysningerOmBarn',
            label: 'Opplysninger om barn',
            components: [
              textField({
                key: 'fornavn',
                label: 'Fornavn',
              }),
              radio({
                key: 'trengerBarnetBriller',
                label: 'Trenger barnet briller?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              alert({
                conditional: {
                  show: true,
                  when: 'opplysningerOmBarn.trengerBarnetBriller',
                  eq: 'ja',
                },
                content: 'Her vises en informasjonstekst.',
                customConditional: "show = (row.trengerBarnetBriller === 'ja');",
                key: 'alertstripe2',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'levering',
        title: 'Levering',
        components: [
          dataGrid({
            addAnother: 'Legg til en pakke til',
            key: 'opplysningerOmPakke',
            label: 'Opplysninger om pakke',
            components: [
              textField({
                key: 'mottakersFornavn',
                label: 'Mottakers fornavn',
              }),
              alert({
                content: 'Fornavn er for langt og vil ikke vises i sin helhet.',
                customConditional: 'show = row.mottakersFornavn.length > 10',
                key: 'alertstripe3',
              }),
              radio({
                key: 'hvordanVilDuHaPakkenLevert',
                label: 'Hvordan vil du ha pakken levert?',
                values: [
                  { label: 'På døra', value: 'paDora' },
                  { label: 'I pakkeboks', value: 'iPakkeboks' },
                  { label: 'Post i butikk', value: 'postIButikk' },
                ],
              }),
              radio({
                conditional: {
                  show: true,
                  when: 'opplysningerOmPakke.hvordanVilDuHaPakkenLevert',
                  eq: 'paDora',
                },
                key: 'hvilkenTypeBoligBorDuI',
                label: 'Hvilken type bolig bor du i?',
                values: [
                  { label: 'Leilighet', value: 'leilighet' },
                  { label: 'Enebolig', value: 'enebolig' },
                  { label: 'Rekkehus', value: 'rekkehus' },
                  { label: 'Tomannsbolig', value: 'tomannsbolig' },
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
          radio({
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
            values: [
              { label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.', value: 'nei' },
              { label: 'Ja, jeg legger det ved denne søknaden.', value: 'leggerVedNaa' },
              { label: 'Jeg ettersender dokumentasjonen senere.', value: 'ettersender' },
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'datagridconditional', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const focusHandlingTranslations = () => getMockTranslationsFromForm(focusHandlingForm());

export { focusHandlingForm, focusHandlingTranslations };
