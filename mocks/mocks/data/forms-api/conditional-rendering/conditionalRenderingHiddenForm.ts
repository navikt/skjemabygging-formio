import { alert, checkbox, htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const conditionalRenderingHiddenForm = () =>
  form({
    title: 'Hidden test',
    formNumber: 'hiddentest',
    path: 'hiddentest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          checkbox({
            key: 'conditional1',
            label: 'Show components',
            validate: { required: false },
          }),
          htmlElement({
            conditional: {
              show: true,
              when: 'conditional1',
              eq: 'true',
            },
            content: '<p>This text should only be visible in form</p>',
            key: 'htmlelement1',
            textDisplay: 'form',
          }),
          alert({
            conditional: {
              show: true,
              when: 'conditional1',
              eq: 'true',
            },
            content: '<p>This alert should only be visible in form</p>',
            key: 'alertstripe',
            textDisplay: 'form',
          }),
          htmlElement({
            conditional: {
              show: true,
              when: 'conditional1',
              eq: 'true',
            },
            content: '<p>This text should only be visible in PDF</p>',
            hidden: true,
            key: 'htmlelement',
            textDisplay: 'pdf',
          }),
          alert({
            conditional: {
              show: true,
              when: 'conditional1',
              eq: 'true',
            },
            content: '<p>This alert should only be visible in PDF</p>',
            hidden: true,
            key: 'alertstripe1',
            textDisplay: 'pdf',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'hiddentest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const conditionalRenderingHiddenTranslations = () => getMockTranslationsFromForm(conditionalRenderingHiddenForm());

export { conditionalRenderingHiddenForm, conditionalRenderingHiddenTranslations };
