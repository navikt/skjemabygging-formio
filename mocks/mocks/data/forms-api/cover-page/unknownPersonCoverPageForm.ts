import { panel } from '../../../form-builder/components';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const unknownPersonCoverPageForm = () => {
  const formNumber = 'coverpageunknownperson';

  return form({
    title: 'Cover page unknown person test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        key: 'personopplysninger',
        components: [yourInformation()],
      }),
    ],
  });
};

const unknownPersonCoverPageTranslations = () => getMockTranslationsFromForm(unknownPersonCoverPageForm());

export { unknownPersonCoverPageForm, unknownPersonCoverPageTranslations };
