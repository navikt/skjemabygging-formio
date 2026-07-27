import { dataGrid, number, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const numberDeprecatedForm = () =>
  form({
    title: 'Testing number component',
    formNumber: 'testingnumber',
    path: 'testingnumber',
    components: [
      panel({
        key: 'dineOpplysninger',
        title: 'Heltall',
        components: [
          number({
            key: 'pakrevd',
            label: 'Påkrevd',
          }),
          number({
            key: 'minmax',
            label: 'Minmax',
            validate: {
              required: false,
              min: 0,
              max: 100,
            },
          }),
          number({
            key: 'calculate1',
            label: 'Kalkulert verdi',
            calculateValue: "value = (data.pakrevd + data.minmax) || ''",
            readOnly: true,
          }),
          dataGrid({
            key: 'datagrid',
            label: 'Datagrid',
            validate: {
              required: false,
            },
            components: [
              number({
                key: 'tall1',
                label: 'Grid',
                validate: {
                  required: false,
                },
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'page3',
        title: 'Desimaltall',
        components: [
          number({
            key: 'desimal1',
            label: 'Desimal 1',
            inputType: 'decimal',
            validate: {
              required: false,
            },
          }),
          number({
            key: 'desimal2',
            label: 'Desimal 2',
            inputType: 'decimal',
            validate: {
              required: false,
            },
          }),
          number({
            key: 'calculate2',
            label: 'Kalkulert verdi',
            calculateValue: "value = (data.desimal2 > 0 && (data.desimal1 / data.desimal2)) || ''",
            readOnly: true,
          }),
          dataGrid({
            key: 'datagrid2',
            label: 'Datagrid',
            validate: {
              required: false,
            },
            components: [
              number({
                key: 'desimal3',
                label: 'Desimalgrid',
                inputType: 'decimal',
                validate: {
                  required: false,
                },
              }),
            ],
          }),
        ],
      }),
    ],
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'testingnumber', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const numberDeprecatedTranslations = () => getMockTranslationsFromForm(numberDeprecatedForm());

export { numberDeprecatedForm, numberDeprecatedTranslations };
