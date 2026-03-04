import { panel, phoneNumber } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const phoneNumberForm = () => {
  const formNumber = 'phonenumber';

  return form({
    title: 'PhoneNumber component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          phoneNumber({
            label: 'Telefonnummer',
            showAreaCode: false,
          }),
          phoneNumber({
            label: 'Telefonnummer med landkode',
            showAreaCode: true,
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          phoneNumber({
            label: 'Telefonnummer påkrevd',
            showAreaCode: false,
            validate: { required: true },
          }),
          phoneNumber({
            label: 'Telefonnummer ikke påkrevd',
            showAreaCode: false,
            validate: { required: false },
          }),
          phoneNumber({
            label: 'Telefonnummer landkode påkrevd',
            showAreaCode: true,
            validate: { required: true },
          }),
        ],
      }),
    ],
  });
};

const phoneNumberTranslations = () => getMockTranslationsFromForm(phoneNumberForm());

export { phoneNumberForm, phoneNumberTranslations };
