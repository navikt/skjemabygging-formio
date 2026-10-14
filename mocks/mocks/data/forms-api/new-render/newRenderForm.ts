import { panel, radio, select, textArea, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formIntroPage from '../../../form-builder/form/formIntroPage';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const newRenderForm = () => {
  const formNumber = 'newrender';

  return form({
    title: 'new renderer test form',
    formNumber,
    path: formNumber,
    introPage: formIntroPage({ enabled: false }),
    components: [
      panel({
        title: 'Page one',
        key: 'pageOne',
        components: [
          textField({ label: 'First name', key: 'firstName', validate: { required: true } }),
          textArea({ label: 'Comment', key: 'comment', validate: { required: false } }),
        ],
      }),
      panel({
        title: 'Page two',
        key: 'pageTwo',
        components: [
          select({
            label: 'Country',
            key: 'country',
            values: [
              { label: 'Norway', value: 'no' },
              { label: 'Sweden', value: 'se' },
            ],
          }),
          radio({
            label: 'Contact method',
            key: 'contactMethod',
            values: [
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
            ],
          }),
        ],
      }),
    ],
  });
};

const newRenderTranslations = () => getMockTranslationsFromForm(newRenderForm());

export { newRenderForm, newRenderTranslations };
