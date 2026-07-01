import {
  attachment,
  container,
  countrySelect,
  currencySelect,
  identity,
  navSelect,
  panel,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

const FORM_TITLE = 'Tester nedtrekksmeny';
const FORM_NUMBER = 'Test-select';

const createInstrumentPageV1 = () =>
  panel({
    title: 'Veiledning',
    key: 'veiledning',
    components: [
      container({
        label: 'Dine opplysninger',
        key: 'dineOpplysninger',
        yourInformation: true,
        components: [identity({ prefill: true, id: 'eokkp96', navId: 'eokkp96' })],
      }),
      navSelect({
        key: 'velgInstrument',
        label: 'Velg instrument',
        id: 'ea6bvue',
        navId: 'edxtdnc',
        validate: { required: true, onlyAvailableItems: true },
        values: [
          { label: 'Piano', value: 'piano' },
          { label: 'Trekkspill', value: 'trekkspill' },
          { label: 'Gitar', value: 'gitar' },
          { label: 'Munnspill', value: 'munnspill' },
          { label: 'Klarinett', value: 'klarinett' },
          { label: 'Trommer', value: 'trommer' },
          { label: 'Cello', value: 'cello' },
          { label: 'Fiolin', value: 'fiolin' },
          { label: 'Harpe', value: 'harpe' },
          { label: 'Tuba', value: 'tuba' },
          { label: 'Blokkfløyte', value: 'blokkfloyte' },
        ],
      }),
      countrySelect({
        key: 'velgLand',
        label: 'Velg land du vil reise til',
        id: 'eupbhut',
        navId: 'e9ly9xe',
        validate: { required: true },
      }),
      currencySelect({
        key: 'velgValutaDuVilBetaleMed',
        label: 'Velg valuta du vil betale med',
        id: 'edyinrd',
        navId: 'egnm2bi',
        validate: { required: true },
      }),
    ],
  });

const createInstrumentPageV2 = () =>
  panel({
    title: 'Veiledning',
    key: 'veiledning',
    components: [
      container({
        label: 'Dine opplysninger',
        key: 'dineOpplysninger',
        yourInformation: true,
        components: [identity({ prefill: true, id: 'eokkp96', navId: 'eokkp96' })],
      }),
      navSelect({
        key: 'velgInstrument',
        label: 'Velg instrument',
        id: 'ea6bvue',
        navId: 'edxtdnc',
        validate: { required: true, onlyAvailableItems: true },
        values: [
          { label: 'Trekkspill', value: 'trekkspill' },
          { label: 'Gitar', value: 'gitar' },
          { label: 'Munnspill', value: 'munnspill' },
          { label: 'Klarinett', value: 'klarinett' },
          { label: 'Trommer', value: 'trommer' },
          { label: 'Cello', value: 'cello' },
          { label: 'Fiolin', value: 'fiolin' },
          { label: 'Harpe', value: 'harpe' },
          { label: 'Tuba', value: 'tuba' },
          { label: 'Blokkfløyte', value: 'blokkfloyte' },
        ],
      }),
      countrySelect({
        key: 'velgLand',
        label: 'Velg land du vil reise til',
        id: 'eupbhut',
        navId: 'e9ly9xe',
        validate: { required: true },
      }),
      currencySelect({
        key: 'velgValutaDuVilBetaleMed',
        label: 'Velg valuta du vil betale med',
        id: 'edyinrd',
        navId: 'egnm2bi',
        validate: { required: true },
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
        key: 'kursbevisPaFullfortPianoopplaering',
        label: 'Kursbevis på fullført pianoopplæring',
        id: 'e772p7',
        navId: 'e772p7',
        validate: { required: true },
        customConditional: "show = data.velgInstrument.value === 'piano'",
        properties: {
          vedleggstittel: 'Kursbevis piano',
          vedleggskode: 'P2',
        },
      }),
      attachment({
        key: 'annenDokumentasjon',
        label: 'Annen dokumentasjon',
        id: 'e9er54e',
        navId: 'e9er54e',
        attachmentType: 'other',
        validate: { required: true },
        description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
      }),
    ],
  });

const createTestSelectForm = (formPath: string, firstPage: ReturnType<typeof createInstrumentPageV1>) =>
  form({
    title: FORM_TITLE,
    formNumber: FORM_NUMBER,
    path: formPath,
    components: [firstPage, createAttachmentPage()],
    properties: {
      ...formProperties({
        formNumber: FORM_NUMBER,
        subjectOfSubmission: 'BIL',
        submissionTypes: ['PAPER', 'DIGITAL'],
        subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
        signatures: {
          values: [{ label: '', description: '' }],
        },
      }),
      isTestForm: false,
    },
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const createTestSelectForms = (formPath: string) => ({
  form: createTestSelectForm(formPath, createInstrumentPageV1()),
  formV2: createTestSelectForm(formPath, createInstrumentPageV2()),
});

export { createTestSelectForms };
