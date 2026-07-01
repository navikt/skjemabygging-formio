import {
  attachment,
  countrySelect,
  currencySelect,
  datePicker,
  navSelect,
  panel,
  radio,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const generalCustomCompsForm = () =>
  form({
    title: 'Cypress sjekker egne komponenter',
    formNumber: 'customcomps',
    path: 'customcomps',
    components: [
      panel({
        key: 'dineopplysninger',
        title: 'Dine opplysninger',
        components: [
          textField({
            autocomplete: 'given-name',
            key: 'fornavn',
            label: 'Fornavn',
          }),
          countrySelect({
            key: 'landvelger',
            label: 'I hvilket land bor du?',
          }),
          currencySelect({
            key: 'valutavelger',
            label: 'Velg valuta',
          }),
          navSelect({
            key: 'velgInstrument',
            label: 'Velg instrument',
            values: [
              { label: 'Piano', value: 'piano' },
              { label: 'Gitar', value: 'gitar' },
              { label: 'Trekkspill', value: 'trekkspill' },
              { label: 'Trommer', value: 'trommer' },
            ],
          }),
          datePicker({
            key: 'gyldigFraDato',
            label: 'Gyldig fra dato',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          radio({
            defaultValue: 'fersken',
            key: 'velgFrukt',
            label: 'Velg frukt',
            values: [
              { label: 'Banan', value: 'banan' },
              { label: 'Eple', value: 'eple' },
              { label: 'Vannmelon', value: 'vannmelon' },
              { label: 'Fersken', value: 'fersken' },
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
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon1',
            label: 'Annen dokumentasjon',
          }),
          attachment({
            key: 'bekreftelsePaSkoleplass1',
            label: 'Bekreftelse på skoleplass',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'customcomps', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const generalCustomCompsTranslations = () => getMockTranslationsFromForm(generalCustomCompsForm());

export { generalCustomCompsForm, generalCustomCompsTranslations };
