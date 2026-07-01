import { panel, year } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const yearDeprecatedForm = () =>
  form({
    title: 'Test årstall',
    formNumber: 'testarstall',
    path: 'testarstall',
    components: [
      panel({
        key: 'panelMedArstall',
        title: 'Panel med årstall',
        components: [
          year({
            key: 'pakrevdArstall',
            label: 'Påkrevd årstall',
          }),
          year({
            key: 'minMaxArstall',
            label: 'MinMax årstall',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testarstall', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const yearDeprecatedTranslations = () => getMockTranslationsFromForm(yearDeprecatedForm());

export { yearDeprecatedForm, yearDeprecatedTranslations };
