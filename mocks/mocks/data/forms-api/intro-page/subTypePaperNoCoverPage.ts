import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const onlypapernocoverpageForm = () => {
  const formNumber = 'onlypapernocoverpage';

  return form({
    title: 'Only paper-no-cover-page',
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
      submissionTypes: ['PAPER_NO_COVER_PAGE'],
    }),
  });
};

const onlypapernocoverpageTranslations = () => getMockTranslationsFromForm(onlypapernocoverpageForm());

export { onlypapernocoverpageForm, onlypapernocoverpageTranslations };
