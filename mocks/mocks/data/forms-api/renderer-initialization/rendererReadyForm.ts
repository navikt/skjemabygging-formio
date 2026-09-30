import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const rendererReadyForm = () =>
  form({
    title: 'Renderer initialization',
    formNumber: 'rendererready',
    path: 'rendererready',
    properties: formProperties({ formNumber: 'rendererready', submissionTypes: ['DIGITAL'] }),
    components: [
      panel({
        key: 'first',
        title: 'First page',
        components: [textField({ key: 'answer', label: 'Answer', validate: { required: false } })],
      }),
      panel({
        key: 'second',
        title: 'Second page',
        components: [textField({ key: 'otherAnswer', label: 'Other answer', validate: { required: false } })],
      }),
    ],
  });

const rendererReadyTranslations = () => getMockTranslationsFromForm(rendererReadyForm());

export { rendererReadyForm, rendererReadyTranslations };
