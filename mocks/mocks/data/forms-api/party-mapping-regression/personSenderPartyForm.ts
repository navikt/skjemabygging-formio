import { panel } from '../../../form-builder/components';
import sender from '../../../form-builder/components/cutomized/sender';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const personSenderPartyForm = () =>
  form({
    title: 'Party mapping person sender test form',
    formNumber: 'Party mapping 001',
    path: 'partymappingpersonsender',
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [yourInformation()],
      }),
      panel({
        title: 'Avsender',
        components: [sender({ senderRole: 'person' })],
      }),
    ],
  });

const personSenderPartyTranslations = () => getMockTranslationsFromForm(personSenderPartyForm());

export { personSenderPartyForm, personSenderPartyTranslations };
