import { container, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

// Container groups child components under a key.
// Settings: label, hideLabel, yourInformation (+ conditional).
// No description, additionalDescription or validation settings.

const containerForm = () => {
  const formNumber = 'container';

  return form({
    title: 'Container component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          container({
            label: 'Beholder med synlig overskrift',
            key: 'beholderSynlig',
            hideLabel: false,
            components: [textField({ label: 'Tekstfelt i beholder' })],
          }),
          container({
            label: 'Beholder med skjult overskrift',
            key: 'beholderSkjult',
            hideLabel: true,
            components: [textField({ label: 'Tekstfelt i beholder med skjult overskrift' })],
          }),
        ],
      }),
    ],
  });
};

const containerTranslations = () => getMockTranslationsFromForm(containerForm());

export { containerForm, containerTranslations };
