import { attachment, htmlElement, navSelect, panel, radio, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';

const submissionMethodForm = () =>
  form({
    title: 'Gjenskaper bug',
    formNumber: 'BUG 10.10-10',
    path: 'submissionmethod',
    components: [
      panel({
        title: 'Veiledning',
        key: 'veiledning',
        components: [
          htmlElement({
            key: 'veiledningstekst',
            content: 'Denne soknaden fyller du ut for a soke om det du trenger.',
          }),
        ],
      }),
      panel({
        title: 'Dine opplysninger',
        key: 'dineOpplysninger',
        components: [
          textField({
            key: 'fornavnSoker',
            label: 'Fornavn',
            validate: { required: true },
            autocomplete: 'given-name',
          }),
          textField({
            key: 'etternavnSoker',
            label: 'Etternavn',
            validate: { required: true },
            autocomplete: 'family-name',
          }),
          radio({
            key: 'borDuINorge',
            label: 'Bor du i Norge?',
            validate: { required: true },
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          navSelect({
            key: 'hvaSokerDuStotteTil',
            label: 'Hva søker du støtte til?',
            validate: { required: true },
            values: [
              { label: 'Briller', value: 'briller' },
              { label: 'Sykkel', value: 'sykkel' },
              { label: 'Hjelm', value: 'hjelm' },
              { label: 'Romaskin', value: 'romaskin' },
              { label: 'Sko', value: 'sko' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Vedlegg',
        key: 'vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            key: 'annenDokumentasjon',
            attachmentType: 'other',
            label: 'Annen dokumentasjon',
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
          }),
          attachment({
            key: 'bekreftelseFraOptiker',
            label: 'Bekreftelse fra optiker',
            validate: { required: true },
            conditional: { show: true, when: 'hvaSokerDuStotteTil', eq: 'briller' },
            properties: {
              vedleggskode: 'O5',
              vedleggstittel: 'Bekreftelse fra optiker',
            },
          }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber: 'BUG 10.10-10',
      submissionTypes: ['PAPER', 'DIGITAL'],
      signatures: { oldSyntax: true, values: [{ label: '' }] },
    }),
  });

const submissionMethodTranslations = () => ({
  _id: 'submethodbug',
  data: {
    scope: 'local',
    form: 'submissionmethod',
    language: 'en',
    i18n: {
      'Gjenskaper bug': 'Reproducing bug',
      'Denne soknaden fyller du ut for a soke om det du trenger.': 'Fill out this form to apply for what you need.',
      'Hva søker du støtte til?': 'What do you apply for?',
      Briller: 'Glasses',
      Sykkel: 'Bike',
      Hjelm: 'Helmet',
      Romaskin: 'Rower',
      Sko: 'Shoes',
      'Bekreftelse fra optiker': 'Confirmation from an optician',
    },
  },
});

export { submissionMethodForm, submissionMethodTranslations };
