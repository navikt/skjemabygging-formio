import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const multipleSubTypesForm = () => {
  const formNumber = 'multiplesubtypes';

  return form({
    title: 'Paper, digital and paper-no-cover-page',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [textField({ label: 'Navn' })],
      }),
    ],
    properties: formProperties({
      formNumber,
      submissionTypes: ['PAPER', 'DIGITAL', 'PAPER_NO_COVER_PAGE'],
    }),
  });
};

const multipleSubTypesTranslations = () => getMockTranslationsFromForm(multipleSubTypesForm());

export { multipleSubTypesForm, multipleSubTypesTranslations };
