import { organizationNumber } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const organizationNumberCoverPageForm = () => {
  const formNumber = 'coverpageorganizationnumber';

  return form({
    title: 'Cover page organization number test form',
    formNumber,
    path: formNumber,
    components: [
      organizationNumber({
        label: 'Organisasjonsnummer',
        coverPageBruker: true,
      }),
    ],
  });
};

const organizationNumberCoverPageTranslations = () => getMockTranslationsFromForm(organizationNumberCoverPageForm());

export { organizationNumberCoverPageForm, organizationNumberCoverPageTranslations };
