import {
  alert,
  dataGrid,
  formGroup,
  htmlElement,
  number,
  panel,
  radio,
  selectBoxes,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datagridSkjemagruppeBugForm = () =>
  form({
    title: 'Datagrid med skjemagruppe',
    formNumber: 'Datagrid 001',
    path: 'datagrid001',
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
        key: 'diverse',
        title: 'Diverse',
        components: [
          dataGrid({
            key: 'maltider',
            label: 'Måltider',
            components: [
              textField({
                key: 'kortBeskrivelse',
                label: 'Kort beskrivelse',
              }),
              selectBoxes({
                key: 'ingredienser',
                label: 'Ingredienser',
                values: [
                  { label: 'Melk', value: 'melk' },
                  { label: 'Brød', value: 'brod' },
                  { label: 'Skinke', value: 'skinke' },
                  { label: 'Kefir', value: 'kefir' },
                  { label: 'Avokado', value: 'avokado' },
                ],
              }),
              radio({
                customConditional: 'show = row.ingredienser.melk || row.ingredienser.kefir;',
                key: 'kjopteDuVareneRettFraBonden',
                label: 'Kjøpte du varene rett fra bonden?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              radio({
                conditional: {
                  show: true,
                  when: 'maltider.kjopteDuVareneRettFraBonden',
                  eq: 'ja',
                },
                key: 'betalteDuMedKontanter',
                label: 'Betalte du med kontanter?',
                values: [
                  { label: 'Ja', value: 'ja' },
                  { label: 'Nei', value: 'nei' },
                ],
              }),
              alert({
                conditional: {
                  show: true,
                  when: 'maltider.ingredienser',
                  eq: 'melk',
                },
                content: '<p>Husk å legge med kvittering på utgiftene til melk</p>',
                key: 'alertstripe',
                textDisplay: 'form',
              }),
              number({
                conditional: {
                  show: true,
                  when: 'maltider.ingredienser',
                  eq: 'avokado',
                },
                key: 'hvaVarPrisenPerAvokado',
                label: 'Hva var prisen per avokado?',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'dinSituasjon',
        title: 'Din situasjon',
        components: [
          dataGrid({
            addAnother: 'Legg til barn',
            key: 'dineBarn',
            label: 'Dine barn',
            components: [
              formGroup({
                key: 'personopplysninger',
                label: 'Skjemagruppe',
                legend: 'Personopplysninger',
                components: [
                  textField({
                    key: 'fornavn1',
                    label: 'Fornavn',
                  }),
                  textField({
                    key: 'etternavn',
                    label: 'Etternavn',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'kjaeledyr',
        title: 'Kjæledyr',
        components: [
          dataGrid({
            key: 'dineKjaeledyr',
            label: 'Dine kjæledyr',
            components: [
              textField({
                key: 'navn',
                label: 'Navn',
              }),
              number({
                key: 'alder',
                label: 'Alder',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'Datagrid 001', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datagridSkjemagruppeBugTranslations = () => getMockTranslationsFromForm(datagridSkjemagruppeBugForm());

export { datagridSkjemagruppeBugForm, datagridSkjemagruppeBugTranslations };
