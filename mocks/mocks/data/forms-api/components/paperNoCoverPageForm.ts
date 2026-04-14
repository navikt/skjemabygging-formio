import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const paperNoCoverPageForm = () => {
  const formNumber = 'papernocoverpage';

  return form({
    title: 'Submission Type: Paper No Cover Page',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [textField({ label: 'Tekstfelt' })],
      }),
    ],
    properties: formProperties({
      formNumber,
      submissionTypes: ['PAPER_NO_COVER_PAGE'],
    }),
  });
};

const paperNoCoverPageTranslations = () => getMockTranslationsFromForm(paperNoCoverPageForm());

export { paperNoCoverPageForm, paperNoCoverPageTranslations };
