import { addressValidity, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const addressValidityTestForm = () => {
  const formNumber = 'addressvalidity';

  return form({
    title: 'AddressValidity component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Standard',
        components: [addressValidity({ key: 'adresseVarighet' })],
      }),
    ],
  });
};

const addressValidityTranslations = () => getMockTranslationsFromForm(addressValidityTestForm());

export { addressValidityTestForm, addressValidityTranslations };
