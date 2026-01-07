import { nationalIdentityNumber, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const fnrFieldForm = () => {
  const formNumber = 'fnrfield';

  return form({
    title: 'FnrField component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          nationalIdentityNumber(),
          nationalIdentityNumber({
            label: 'Fødselsnummer med beskrivelse',
            description: '<p>Beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
            additionalDescriptionText: '<p>Utvidet beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [nationalIdentityNumber({ label: 'Fødselsnummer påkrevd' })],
      }),
    ],
  });
};

const fnrFieldTranslations = () => getMockTranslationsFromForm(fnrFieldForm());

export { fnrFieldForm, fnrFieldTranslations };
