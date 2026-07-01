import {
  attachment,
  checkbox,
  container,
  dataGrid,
  formGroup,
  iban,
  identity,
  monthPicker,
  nationalIdentityNumber,
  navSelect,
  number,
  panel,
  radio,
  textField,
  year,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

const FORM_TITLE = 'Test mellomlagring';
const FORM_NUMBER = 'testMellomlagring';

const createYourInformation = () =>
  container({
    label: 'Dine opplysninger',
    key: 'dineOpplysninger',
    yourInformation: true,
    components: [identity({ prefill: true, id: 'eokkp96', navId: 'eokkp96' })],
  });

const createBreakfastGroup = () =>
  formGroup({
    label: 'Frokost',
    key: 'navSkjemagruppe',
    components: [
      formGroup({
        label: 'Drikke',
        key: 'navSkjemagruppe1',
        components: [
          textField({
            key: 'hvaDrakkDuTilFrokost',
            label: 'Hva drakk du til frokost',
            id: 'ed9035o',
            navId: 'ebz5qji',
            validate: { required: false },
          }),
        ],
      }),
      textField({
        key: 'hvaSyntesDuOmFrokosten',
        label: 'Hva syntes du om frokosten?',
        id: 'e1frukost',
        navId: 'e1frukost',
        validate: { required: true },
        customConditional: 'show = !!data.hvaDrakkDuTilFrokost',
      }),
    ],
  });

const createHiddenComponentToggle = () =>
  radio({
    key: 'visSkjulteKomponenter',
    label: 'Vis skjulte komponenter',
    id: 'ebi4fua',
    navId: 'eg5fcls',
    validate: { required: false, onlyAvailableItems: false },
    values: [
      { label: 'Ja', value: 'ja' },
      { label: 'Nei', value: 'nei' },
    ],
  });

const createHiddenValidationFields = () => {
  const showWhenToggleIsYes = { when: 'visSkjulteKomponenter', eq: 'ja', show: true };

  return [
    monthPicker({
      key: 'narSluttetDuAArbeideManedOgAr',
      label: 'Velg en måned',
      id: 'ekmpe5',
      navId: 'ekmpe5',
      validate: { required: true, minYear: 1992, maxYear: 1999 },
      conditional: showWhenToggleIsYes,
    }),
    number({
      key: 'tall',
      label: 'Tall',
      id: 'etall',
      navId: 'etall',
      validate: { required: true },
      conditional: showWhenToggleIsYes,
    }),
    year({
      key: 'arstall',
      label: 'Årstall',
      id: 'earstall',
      navId: 'earstall',
      validate: { required: true, minYear: 1900, maxYear: 2100 },
      conditional: showWhenToggleIsYes,
    }),
    iban({
      key: 'iban',
      label: 'IBAN',
      id: 'eiban',
      navId: 'eiban',
      validate: { required: true },
      conditional: showWhenToggleIsYes,
    }),
    nationalIdentityNumber({
      key: 'fodselsnummerDNummer',
      label: 'Fødselsnummer eller d-nummer',
      id: 'eybne8c',
      navId: 'euaw13c',
      validate: { required: true },
      conditional: showWhenToggleIsYes,
    }),
  ];
};

const createValuesPage = () =>
  panel({
    title: 'Valgfrie opplysninger',
    key: 'valgfrieOpplysninger',
    components: [
      createYourInformation(),
      createBreakfastGroup(),
      createHiddenComponentToggle(),
      ...createHiddenValidationFields(),
    ],
  });

const createGiftPage = () =>
  panel({
    title: 'Gave',
    key: 'gave',
    components: [
      radio({
        key: 'onskerDuAFaGavenInnpakket',
        label: 'Ønsker du å få gaven innpakket',
        id: 'egave',
        navId: 'egave',
        validate: { required: true },
        values: [
          { label: 'Ja', value: 'ja' },
          { label: 'Nei', value: 'nei' },
        ],
      }),
      radio({
        key: 'farge',
        label: 'Farge',
        id: 'efarge',
        navId: 'efarge',
        validate: { required: true },
        conditional: { when: 'onskerDuAFaGavenInnpakket', eq: 'ja', show: true },
        values: [
          { label: 'Rød', value: 'rod' },
          { label: 'Grønn', value: 'gronn' },
        ],
      }),
      textField({
        key: 'tekstPaKortet',
        label: 'Tekst på kortet',
        id: 'ekorttekst',
        navId: 'ekorttekst',
        validate: { required: true },
        conditional: { when: 'onskerDuAFaGavenInnpakket', eq: 'ja', show: true },
      }),
    ],
  });

const createDeliveryPageV1 = () =>
  panel({
    title: 'Levering',
    key: 'levering',
    components: [
      navSelect({
        key: 'hvordanOnskerDuAMottaPakken',
        label: 'Hvordan ønsker du å motta pakken?',
        id: 'e3vwglb',
        navId: 'edqy1v',
        validate: { required: true, onlyAvailableItems: false },
        values: [
          { label: 'På døra', value: 'paDora' },
          { label: 'Post i butikk', value: 'postIButikk' },
          { label: 'Hente selv', value: 'henteSelv' },
        ],
      }),
      dataGrid({
        key: 'datagrid',
        label: 'Ønskeliste',
        id: 'euimv9',
        navId: 'e5z29dy',
        components: [textField({ key: 'tekstfelt', label: 'Gaveønske', validate: { required: false } })],
      }),
    ],
  });

const createDeliveryPageV2 = () =>
  panel({
    title: 'Levering',
    key: 'levering',
    components: [
      navSelect({
        key: 'hvordanOnskerDuAMottaPakken',
        label: 'Hvordan ønsker du å motta pakken?',
        id: 'e3vwglb',
        navId: 'edqy1v',
        validate: { required: true, onlyAvailableItems: true },
        values: [
          { label: 'Post i butikk', value: 'postIButikk' },
          { label: 'Hente selv', value: 'henteSelv' },
        ],
      }),
    ],
  });

const createPostInStorePage = () =>
  panel({
    title: 'Velg post i butikk',
    key: 'velgPostIButikk',
    customConditional: 'show = data.hvordanOnskerDuAMottaPakken.value === "postIButikk";',
    components: [
      textField({
        key: 'navnPaButikkHvorDuOnskerAHentePakken',
        label: 'Navn på butikk hvor du ønsker å hente pakken',
        id: 'eqwvpk9',
        navId: 'eivvqzwk',
      }),
    ],
  });

const createExtraPage = () =>
  panel({
    title: 'Ekstra',
    key: 'ekstra',
    components: [
      textField({
        key: 'hemmeligKode',
        label: 'Hemmelig kode',
        id: 'ehemmeligkode',
        navId: 'ehemmeligkode',
        validate: { required: false },
      }),
      checkbox({
        key: 'kryssAvHvisDuOnskerDagligReklamePaEPost',
        label: 'Kryss av hvis du ønsker daglig reklame på e-post',
        id: 'ereklame',
        navId: 'ereklame',
        validate: { required: false },
      }),
    ],
  });

const createAttachmentPage = () =>
  panel({
    title: 'Vedlegg',
    key: 'vedlegg',
    isAttachmentPanel: true,
    components: [
      attachment({
        key: 'annenDokumentasjon',
        label: 'Annen dokumentasjon',
        id: 'em26fir',
        navId: 'em26fir',
        attachmentType: 'other',
        validate: { required: true },
        description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
        attachmentValues: [
          { value: 'nei', label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.' },
          { value: 'leggerVedNaa', label: 'Ja, jeg legger det ved denne søknaden.' },
          { value: 'ettersender', label: 'Jeg ettersender dokumentasjonen senere.' },
        ],
        properties: {
          vedleggstittel: 'Annet',
          vedleggskode: 'N6',
        },
      }),
      attachment({
        key: 'oppmotebekreftelse',
        label: 'Oppmøtebekreftelse',
        id: 'eijyzy',
        navId: 'eijyzy',
        validate: { required: true },
        attachmentValues: [
          { value: 'leggerVedNaa', label: 'Jeg legger det ved denne søknaden (anbefalt)' },
          {
            value: 'ettersender',
            label:
              'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
          },
          { value: 'levertTidligere', label: 'Jeg har levert denne dokumentasjonen tidligere' },
        ],
        properties: {
          vedleggstittel: 'Bekreftelse på oppmøte',
          vedleggskode: 'M2',
        },
      }),
      attachment({
        key: 'bekreftelsePaAtDuAvHelsemessigeArsakerMaBenytteDyrereTransport',
        label: 'Bekreftelse på at du av helsemessige årsaker må benytte dyrere transport',
        id: 'e3dw1sg',
        navId: 'e3dw1sg',
        validate: { required: true },
        attachmentValues: [
          { value: 'leggerVedNaa', label: 'Jeg legger det ved denne søknaden (anbefalt)' },
          {
            value: 'ettersender',
            label:
              'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
          },
          { value: 'levertTidligere', label: 'Jeg har levert denne dokumentasjonen tidligere' },
        ],
        properties: {
          vedleggstittel: ' Dokumentasjon av behov for dyrere transportmiddel',
          vedleggskode: 'M4',
        },
      }),
    ],
  });

const createTestMellomlagringForm = (formPath: string, deliveryPage: ReturnType<typeof createDeliveryPageV1>) =>
  form({
    title: FORM_TITLE,
    formNumber: FORM_NUMBER,
    path: formPath,
    components: [
      createValuesPage(),
      createGiftPage(),
      deliveryPage,
      createPostInStorePage(),
      createExtraPage(),
      createAttachmentPage(),
    ],
    properties: {
      ...formProperties({
        formNumber: FORM_NUMBER,
        subjectOfSubmission: 'BAR',
        submissionTypes: ['PAPER', 'DIGITAL'],
        subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
        signatures: {
          values: [{ label: '', description: '' }],
        },
      }),
      isTestForm: true,
    },
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const createTestMellomlagringForms = (formPath: string) => ({
  form: createTestMellomlagringForm(formPath, createDeliveryPageV1()),
  formV2: createTestMellomlagringForm(formPath, createDeliveryPageV2()),
});

export { createTestMellomlagringForms };
