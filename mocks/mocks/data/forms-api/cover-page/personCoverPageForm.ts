import { panel } from '../../../form-builder/components';
import identity from '../../../form-builder/components/cutomized/identity';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const personCoverPageForm = () => {
  const formNumber = 'coverpageperson';

  return form({
    title: 'Cover page person test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        key: 'personopplysninger',
        components: [
          yourInformation({
            components: [identity({ prefill: true })],
          }),
        ],
      }),
    ],
  });
};

const personCoverPageTranslations = () => getMockTranslationsFromForm(personCoverPageForm());

export { personCoverPageForm, personCoverPageTranslations };
