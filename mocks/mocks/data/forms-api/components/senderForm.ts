import { panel, sender } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const senderForm = () => {
  const formNumber = 'sender';

  return form({
    title: 'Sender component test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Person',
        components: [
          sender({
            label: 'Mottaker (person)',
            key: 'mottakerPerson',
            senderRole: 'person',
          }),
        ],
      }),
      panel({
        title: 'Organisasjon',
        components: [
          sender({
            label: 'Mottaker (organisasjon)',
            key: 'mottakerOrganisasjon',
            senderRole: 'organization',
          }),
        ],
      }),
    ],
  });
};

const senderTranslations = () => getMockTranslationsFromForm(senderForm());

export { senderForm, senderTranslations };
