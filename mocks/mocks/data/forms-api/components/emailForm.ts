import { email, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const emailForm = () => {
  const formNumber = 'email';

  return form({
    title: 'Email component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          email({
            label: 'E-post',
            key: 'epost',
          }),
          email({
            label: 'E-post med beskrivelse',
            key: 'epostmedbeskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          email({
            label: 'E-post påkrevd',
            key: 'epostpakrevd',
            validate: {
              required: true,
            },
          }),
          email({
            label: 'E-post ikke påkrevd',
            key: 'epostikkepakrevd',
            validate: {
              required: false,
            },
          }),
          email({
            label: 'E-post egendefinert',
            key: 'epostegendefinert',
            validate: {
              required: false,
              custom: 'valid = input.includes("nav") ? true : "E-postadressen må inneholde nav"',
            },
          }),
        ],
      }),
    ],
  });
};

const emailTranslations = () => {
  return getMockTranslationsFromForm(emailForm());
};

export { emailForm, emailTranslations };
