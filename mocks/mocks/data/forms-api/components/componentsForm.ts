import {
  accordion,
  accountNumber,
  activites,
  address,
  addressValidity,
  alert,
  attachment,
  checkbox,
  container,
  countrySelect,
  currency,
  currencySelect,
  dataFetcher,
  dataGrid,
  datePicker,
  email,
  firstName,
  formGroup,
  htmlElement,
  iban,
  identity,
  image,
  maalgruppe,
  monthPicker,
  nationalIdentityNumber,
  navSelect,
  number,
  organizationNumber,
  panel,
  phoneNumber,
  radio,
  row,
  select,
  selectBoxes,
  surname,
  textArea,
  textField,
  year,
  yourInformation,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const defaultProps = { validate: { required: false } };

const componentsForm = () => {
  const formNumber = 'components';

  return form({
    title: 'Components',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        ...defaultProps,
        title: 'Dine opplysninger',
        key: 'personopplysninger',
        components: [
          yourInformation({
            components: [identity({ ...defaultProps })],
          }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Standard felter',
        components: [
          textField({ ...defaultProps, label: 'Tekstfelt' }),
          textArea({ ...defaultProps, label: 'Tekstområde' }),
          number({ ...defaultProps, label: 'Tall' }),
          checkbox({ ...defaultProps, label: 'Avkryssingsboks' }),
          selectBoxes({
            ...defaultProps,
            label: 'Flervalg',
            values: [
              { label: 'Ja', value: 'true' },
              { label: 'Nei', value: 'false' },
            ],
          }),
          navSelect({
            ...defaultProps,
            label: 'Nedtrekksmeny (navSelect)',
            values: [
              { label: 'Ja', value: 'yes' },
              { label: 'Nei', value: 'false' },
            ],
          }),
          select({
            ...defaultProps,
            label: 'Nedtrekksmeny (select)',
            values: [
              { label: 'Ja', value: 'yes' },
              { label: 'Nei', value: 'false' },
            ],
          }),
          select({
            ...defaultProps,
            label: 'Nedtrekksmeny (select HTML5)',
            widget: 'html5',
            values: [
              { label: '0,50', value: '0.50' },
              { label: '0,25', value: '0.25' },
              { label: '0,00', value: '0.00' },
              { label: '-0,25', value: '-0.25' },
              { label: '-0,50', value: '-0.50' },
            ],
          }),
          radio({
            ...defaultProps,
            label: 'Radiopanel',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          image({ ...defaultProps, label: 'Bilde' }),
          alert({ ...defaultProps, content: '<p>Alert info</p>', textDisplay: 'form' }),
          alert({ ...defaultProps, content: '<p>Alert suksess</p>', textDisplay: 'formPdf' }),
          alert({ ...defaultProps, content: '<p>Alert error</p>', textDisplay: 'pdf' }),
          htmlElement({
            ...defaultProps,
            content: '<p>HTML Blokk</p>',
            additionalDescriptionText: '<p>Utvidet beskrivelse på html blokk</p>',
            additionalDescriptionLabel: 'Les mer',
            textDisplay: 'formPdf',
          }),
          accordion({
            ...defaultProps,
            label: 'Trekkspill',
            accordionValues: [
              { title: 'En', content: '<p>Tekst en</p>' },
              { title: 'To', content: '<p>Tekst to</p>' },
            ],
          }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Person',
        components: [
          nationalIdentityNumber({ ...defaultProps }),
          firstName({ ...defaultProps }),
          surname({ ...defaultProps }),
          address({ ...defaultProps }),
          addressValidity({ ...defaultProps }),
          textField({ ...defaultProps, label: 'Vegadresse', autocomplete: 'street-address' }),
          textField({ ...defaultProps, label: 'Postnummer', autocomplete: 'postal-code' }),
          textField({ ...defaultProps, label: 'Poststed', autocomplete: 'address-level2' }),
          countrySelect({ ...defaultProps }),
          email({ ...defaultProps }),
          phoneNumber({ ...defaultProps }),
          textField({ ...defaultProps, label: 'Statsborgerskap' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Penger og konto',
        components: [
          currency({ ...defaultProps }),
          row({
            ...defaultProps,
            label: 'Angi valuta og beløp',
            components: [currencySelect({ ...defaultProps }), number({ ...defaultProps, label: 'Beløp' })],
          }),
          accountNumber({ ...defaultProps }),
          iban({ ...defaultProps }),
          currencySelect({ ...defaultProps }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Bedrift / organisasjon',
        components: [organizationNumber({ ...defaultProps }), textField({ ...defaultProps, label: 'Arbeidsgiver' })],
      }),
      panel({
        ...defaultProps,
        title: 'Dato og tid',
        components: [
          datePicker({ ...defaultProps }),
          textField({ ...defaultProps, label: 'Klokkeslett (tt:mm)' }),
          monthPicker({ ...defaultProps }),
          year({ ...defaultProps }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Gruppering',
        components: [
          container({
            ...defaultProps,
            label: 'Beholder',
            components: [
              formGroup({
                ...defaultProps,
                label: 'Skjemagruppe 1',
                components: [
                  textField({ ...defaultProps, label: 'Tekstfelt skjemagruppe 1' }),
                  dataGrid({
                    ...defaultProps,
                    label: 'Skjemagruppe 2',
                    components: [textField({ ...defaultProps, label: 'Tekstfelt skjemagruppe 2' })],
                  }),
                ],
              }),
              dataGrid({
                ...defaultProps,
                label: 'Repeterende data',
                components: [textField({ ...defaultProps, label: 'Tekstfelt repeterende data' })],
              }),
            ],
          }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Andre',
        components: [
          checkbox({
            ...defaultProps,
            label: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
            key: 'confirmationcheckbox',
          }),
          container({
            ...defaultProps,
            label: 'Aktiviteter og målgruppe',
            components: [activites({ ...defaultProps }), maalgruppe({ ...defaultProps })],
          }),
          dataFetcher({ ...defaultProps, dataFetcherSourceId: 'activities' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            ...defaultProps,
            attachmentType: 'default',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  label: 'Mer info',
                  enabled: true,
                  description: 'Vennligst gi oss mer info',
                },
              },
            },
          }),
          attachment({ ...defaultProps, attachmentType: 'other' }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber,
      signatures: {
        values: [
          { label: 'Eier', description: 'Viktig1' },
          { label: 'Deleier', description: 'Viktig2' },
        ],
      },
    }),
  });
};

const componentsTranslations = () => {
  const baseTranslations = getMockTranslationsFromForm(componentsForm());

  return {
    ...baseTranslations,
    data: {
      ...baseTranslations.data,
      i18n: {
        ...baseTranslations.data.i18n,
        Components: 'Components',
        Person: 'Person',
        'Standard felter': 'Standard fields',
        Tekstfelt: 'Text field',
        Tekstområde: 'Text area',
        Tall: 'Number',
        Avkryssingsboks: 'Checkbox',
        Flervalg: 'Multiple choice',
        'Nedtrekksmeny (navSelect)': 'Dropdown (navSelect)',
        'Nedtrekksmeny (select)': 'Dropdown (select)',
        'Nedtrekksmeny (select HTML5)': 'Dropdown (select HTML5)',
        Radiopanel: 'Radio panel',
        'HTML Blokk': 'HTML Block',
        '<p>HTML Blokk</p>': '<p>HTML Block</p>',
        'Alert suksess': 'Alert success',
        'Alert error': 'Alert error',
        '<p>Alert suksess</p>': '<p>Alert success</p>',
        '<p>Alert error</p>': '<p>Alert error</p>',
        'Penger og konto': 'Money and account',
        Beløp: 'Amount',
        Kontonummer: 'Account number',
        'Bedrift / organisasjon': 'Company / organization',
        Organisasjonsnummer: 'Organisation number',
        Arbeidsgiver: 'Employer',
        'Dato og tid': 'Date and time',
        Dato: 'Date',
        'Dato (dd.mm.åååå)': 'Date',
        'Klokkeslett (tt:mm)': 'Time',
        Månedsvelger: 'Month picker',
        'Månedsvelger (mm.åååå)': 'Month picker',
        År: 'Year',
        Årstall: 'Year',
        Gruppering: 'Grouping',
        Beholder: 'Container',
        'Skjemagruppe 1': 'Form group 1',
        'Skjemagruppe 2': 'Form group 2',
        'Tekstfelt skjemagruppe 1': 'Text field form group 1',
        'Tekstfelt skjemagruppe 2': 'Text field form group 2',
        'Repeterende data': 'Repeating data',
        'Tekstfelt repeterende data': 'Text field repeating data',
        Andre: 'Other',
        'Jeg bekrefter at jeg vil svare så riktig som jeg kan.': 'I confirm that I will answer as accurately as I can',
        'Aktiviteter og målgruppe': 'Activities and target group',
        Adresse: 'Address',
        Vegadresse: 'Street address',
        Postnummer: 'Postal code',
        Poststed: 'City',
        'Gyldig fra (dd.mm.åååå)': 'Valid from',
        'Gyldig til (dd.mm.åååå)': 'Valid to',
        'Velg land': 'Select country',
        Land: 'Select country',
        'E-post': 'E-mail',
        Telefonnummer: 'Telephone number',
        Statsborgerskap: 'Citizenship',
        'Velg valuta': 'Select currency',
        'Norsk krone (NOK)': 'Norwegian krone (NOK)',
        'Svensk krone (SEK)': 'Swedish krona (SEK)',
        'Mer info': 'More info',
        'Vennligst gi oss mer info': 'Please give us more info',
        'Les mer': 'Read more',
        '<p>Utvidet beskrivelse på html blokk</p>': '<p>Extended description for HTML block</p>',
      },
    },
  };
};

export { componentsTranslations };
export default componentsForm;
