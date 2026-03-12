import { panel, sender } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const senderForm = () => {
  const formNumber = 'recipient';

  return form({
    title: 'Recipient component test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Person',
        components: [
          sender({
            label: 'Mottaker (person)',
            key: 'mottakerPerson',
            role: 'person',
            validate: { required: true },
          }),
        ],
      }),
      panel({
        title: 'Organisasjon',
        components: [
          sender({
            label: 'Mottaker (organisasjon)',
            key: 'mottakerOrganisasjon',
            role: 'organization',
            validate: { required: true },
          }),
        ],
      }),
    ],
  });
};

const senderTranslations = () => getMockTranslationsFromForm(senderForm());

export { senderForm, senderTranslations };
