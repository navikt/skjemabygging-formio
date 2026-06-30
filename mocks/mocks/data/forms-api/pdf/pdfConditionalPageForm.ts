import { alert, checkbox, container, identity, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const pdfConditionalPageForm = () =>
  form({
    title: 'Conditional page',
    formNumber: 'conditional-page',
    path: 'conditionalpage',
    components: [
      panel({
        key: 'veiledning',
        title: 'Page 1',
        components: [
          container({
            key: 'dineOpplysninger',
            label: 'Dine opplysninger',
            components: [
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
              }),
            ],
          }),
          checkbox({
            key: 'Avkryssingsboks',
            label: 'Avkryssingsboks',
          }),
          textField({
            key: 'tekstfelt',
            label: 'Tekstfelt',
          }),
        ],
      }),
      panel({
        key: 'page2',
        title: 'Page 2',
        components: [
          checkbox({
            key: 'Avkryssingsboks1',
            label: ' Avkryssingsboks 1',
          }),
          textField({
            key: 'tekstfelt',
            label: 'Tekstfelt',
          }),
        ],
      }),
      panel({
        key: 'page3',
        title: 'Page 3',
        components: [
          checkbox({
            key: 'Avkryssingsboks2',
            label: 'Avkryssingsboks 2',
          }),
          checkbox({
            conditional: {
              show: true,
              when: 'Avkryssingsboks2',
              eq: 'true',
            },
            key: 'Avkryssingsboks3',
            label: 'Avkryssingsboks 3',
          }),
          textField({
            key: 'tekstfelt',
            label: 'Tekstfelt',
          }),
          alert({
            conditional: {
              show: true,
              when: 'Avkryssingsboks3',
              eq: 'true',
            },
            content: '<p>Dette er en tekst.</p>',
            key: 'alertstripe',
          }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber: 'conditional-page',
      submissionTypes: ['DIGITAL_NO_LOGIN', 'DIGITAL', 'PAPER'],
    }),
  });

const pdfConditionalPageTranslations = () => getMockTranslationsFromForm(pdfConditionalPageForm());

export { pdfConditionalPageForm, pdfConditionalPageTranslations };
