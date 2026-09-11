import { panel } from '../../../form-builder/components';
import sender from '../../../form-builder/components/cutomized/sender';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const organizationSenderPartyForm = () =>
  form({
    title: 'Party mapping organization sender test form',
    formNumber: 'Party mapping 002',
    path: 'partymappingorganizationsender',
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [yourInformation()],
      }),
      panel({
        title: 'Avsender',
        components: [sender({ senderRole: 'organization' })],
      }),
    ],
  });

const organizationSenderPartyTranslations = () => getMockTranslationsFromForm(organizationSenderPartyForm());

export { organizationSenderPartyForm, organizationSenderPartyTranslations };
