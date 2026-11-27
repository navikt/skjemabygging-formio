import { panel } from '../../../form-builder/components';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const prefillUnavailablePartyForm = () =>
  form({
    title: 'Party mapping prefill unavailable test form',
    formNumber: 'Party mapping 003',
    path: 'partymappingprefillunavailable',
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [yourInformation()],
      }),
    ],
  });

const prefillUnavailablePartyTranslations = () => getMockTranslationsFromForm(prefillUnavailablePartyForm());

export { prefillUnavailablePartyForm, prefillUnavailablePartyTranslations };
