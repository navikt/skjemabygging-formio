import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const rendererFallbackForm = () =>
  form({
    title: 'Renderer fallback',
    formNumber: 'rendererfallback',
    path: 'rendererfallback',
    properties: formProperties({ formNumber: 'rendererfallback', submissionTypes: ['PAPER', 'DIGITAL'] }),
    introPage: formIntroPageWithoutSelfDeclaration(),
    components: [
      panel({
        key: 'first',
        title: 'First page',
        components: [
          textField({
            key: 'answer',
            label: 'Legacy answer',
            validate: { required: true, custom: 'valid = input === "accepted" ? true : "Enter accepted";' },
          }),
        ],
      }),
    ],
  });

const rendererFallbackTranslations = () => getMockTranslationsFromForm(rendererFallbackForm());

export { rendererFallbackForm, rendererFallbackTranslations };
