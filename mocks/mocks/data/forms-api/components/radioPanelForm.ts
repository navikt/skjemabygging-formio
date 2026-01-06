import { panel, radio } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const radioPanelForm = () => {
  const formNumber = 'radiopanel';

  return form({
    title: 'Radio component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          radio({
            label: 'Radio',
            values: [
              { label: 'NRK P1', value: 'nrkp1' },
              { label: 'NRK P2', value: 'nrkp2' },
            ],
          }),
          radio({
            label: 'Radio med beskrivelse',
            description: '<p>Beskrivelse</p>',
            additionalDescriptionText: '<p>Utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
            values: [
              { label: 'NRK P3', value: 'nrkp3' },
              { label: 'NRK P13', value: 'nrkp13' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Data',
        components: [
          radio({
            label: 'Radioknapper med beskrivelse',
            values: [
              { label: 'Ja', value: 'ja', description: 'Positivt svar' },
              { label: 'Nei', value: 'nei', description: 'Negativt svar' },
              { label: 'Kanskje', value: 'kanskje', description: 'Nølende svar' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          radio({
            label: 'Radioknapper påkrevd',
            validate: {
              required: true,
            },
          }),
          radio({
            label: 'Radioknapper ikke påkrevd',
            validate: {
              required: false,
            },
          }),
        ],
      }),
    ],
  });
};

const radioPanelTranslations = () => getMockTranslationsFromForm(radioPanelForm());

export { radioPanelForm, radioPanelTranslations };
