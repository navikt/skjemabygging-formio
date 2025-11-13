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
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';

const defaultProps = { validate: { required: false } };

const componentsForm = () => {
  return form({
    title: 'Components',
    formNumber: 'components',
    components: [
      panel({
        ...defaultProps,
        title: 'Dine opplysninger',
        components: [
          container({
            ...defaultProps,
            label: 'Dine opplysninger',
            components: [identity({ ...defaultProps, label: 'Identitet' })],
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
          nationalIdentityNumber({ ...defaultProps, label: 'Fødselsnummer eller d-nummer' }),
          firstName({ ...defaultProps, label: 'Fornavn' }),
          surname({ ...defaultProps, label: 'Etternavn' }),
          address({ ...defaultProps, label: 'Adresse' }),
          addressValidity({ ...defaultProps, label: 'Adresse varighet' }),
          textField({ ...defaultProps, label: 'Vegadresse' }),
          textField({ ...defaultProps, label: 'Postnummer' }),
          textField({ ...defaultProps, label: 'Poststed' }),
          countrySelect({ ...defaultProps, label: 'Velg land' }),
          email({ ...defaultProps, label: 'E-post' }),
          phoneNumber({ ...defaultProps, label: 'Telefonnummer' }),
          textField({ ...defaultProps, label: 'Statsborgerskap' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Penger og konto',
        components: [
          currency({ ...defaultProps, label: 'Beløp' }),
          row({
            ...defaultProps,
            label: 'Angi valuta og beløp',
            components: [
              currencySelect({ ...defaultProps, label: 'Velg valuta' }),
              number({ ...defaultProps, label: 'Beløp' }),
            ],
          }),
          accountNumber({ ...defaultProps, label: 'Kontonummer' }),
          iban({ ...defaultProps, label: 'IBAN' }),
          currencySelect({ ...defaultProps, label: 'Velg valuta' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Bedrift / organisasjon',
        components: [
          organizationNumber({ ...defaultProps, label: 'Organisasjonsnummer' }),
          textField({ ...defaultProps, label: 'Arbeidsgiver' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Dato og tid',
        components: [
          datePicker({ ...defaultProps, label: 'Dato (dd.mm.åååå)' }),
          textField({ ...defaultProps, label: 'Klokkeslett (tt:mm)' }),
          monthPicker({ ...defaultProps, label: 'Månedsvelger (mm.åååå)' }),
          year({ ...defaultProps, label: 'Årstall' }),
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
          checkbox({ ...defaultProps, label: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }),
          container({
            ...defaultProps,
            label: 'Aktiviteter og målgruppe',
            components: [
              activites({ ...defaultProps, label: 'Hvilken aktivitet søker du om støtte i forbindelse med?' }),
              maalgruppe({ ...defaultProps, label: 'Målgruppe' }),
            ],
          }),
          dataFetcher({ ...defaultProps, dataFetcherSourceId: 'activities' }),
        ],
      }),
      panel({
        ...defaultProps,
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({ ...defaultProps, attachmentType: 'default' }),
          attachment({ ...defaultProps, attachmentType: 'other' }),
        ],
      }),
    ],
  });
};

export default componentsForm;
