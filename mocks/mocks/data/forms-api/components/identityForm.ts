import { identity, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const identityTestForm = () => {
  const formNumber = 'identitet';

  return form({
    title: 'Identity component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Standard',
        components: [identity({ key: 'identitet1' })],
      }),
      panel({
        title: 'Tilpasset ledetekst',
        components: [
          {
            ...identity({ key: 'identitet2' }),
            customLabels: { doYouHaveIdentityNumber: 'Har du et gyldig identitetsdokument?' },
          },
        ],
      }),
    ],
  });
};

const identityTranslations = () => getMockTranslationsFromForm(identityTestForm());

export { identityTestForm, identityTranslations };
