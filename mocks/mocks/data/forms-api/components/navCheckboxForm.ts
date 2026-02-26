import { checkbox, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const navCheckboxForm = () => {
  const formNumber = 'navcheckbox';

  return form({
    title: 'NavCheckbox component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          checkbox({
            label: 'Avkryssingsboks',
          }),
          checkbox({
            label: 'Avkryssingsboks med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          checkbox({
            label: 'Avkryssingsboks påkrevd',
            validate: {
              required: true,
            },
          }),
          checkbox({
            label: 'Avkryssingsboks ikke påkrevd',
            validate: {
              required: false,
            },
          }),
          checkbox({
            label: 'Avkryssingsboks egendefinert',
            validate: {
              custom: 'valid = input === true ? true : "Du må godta vilkårene"',
            },
          }),
        ],
      }),
    ],
  });
};

const navCheckboxTranslations = () => {
  return getMockTranslationsFromForm(navCheckboxForm());
};

export { navCheckboxForm, navCheckboxTranslations };
