import { checkbox, panel, radio } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';

const conditionalRenderingChristmasForm = () =>
  form({
    title: 'Julemat',
    formNumber: 'test-magnus-007',
    path: 'conditionalrenderingchristmas',
    components: [
      panel({
        title: 'Julemeny',
        key: 'veiledning',
        components: [
          radio({
            key: 'radiopanel1',
            label: 'Julemiddag',
            validate: { required: true },
            values: [
              { label: 'Pinnekjøtt', value: 'pinnekjott' },
              { label: 'Lutefisk', value: 'lutefisk' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Pinnekjøtt',
        key: 'pinnekjott',
        conditional: { show: true, when: 'radiopanel1', eq: 'pinnekjott' },
        components: [checkbox({ key: 'rotmos', label: 'Rotmos' })],
      }),
      panel({
        title: 'Lutefisk',
        key: 'lutefisk',
        conditional: { show: true, when: 'radiopanel1', eq: 'lutefisk' },
        components: [checkbox({ key: 'erterstuing', label: 'Erterstuing' })],
      }),
      panel({
        title: 'Marsipangris',
        key: 'marsipangris',
        components: [checkbox({ key: 'sjokoladetrekk', label: 'Sjokoladetrekk' })],
      }),
    ],
    properties: formProperties({
      formNumber: 'test-magnus-007',
      submissionTypes: ['PAPER'],
    }),
  });

const conditionalRenderingChristmasTranslations = () => ({
  _id: '124',
  data: {
    scope: 'local',
    form: 'conditionalrenderingchristmas',
    language: 'en',
    i18n: {
      Pinnekjøtt: 'Lamb ribs',
      Lutefisk: 'Lye fish',
      Julemat: 'Christmas food',
      Julemiddag: 'Christmas dinner',
      Julemeny: 'Christmas meny',
      Marsipangris: 'Marzipan pig',
      Rotmos: 'Root stew',
      Erterstuing: 'Pea stew',
      Sjokoladetrekk: 'Chocolate coating',
    },
  },
});

export { conditionalRenderingChristmasForm, conditionalRenderingChristmasTranslations };
