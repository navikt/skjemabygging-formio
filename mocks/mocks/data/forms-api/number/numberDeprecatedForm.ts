import { dataGrid, number, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
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
          }),
          number({
            key: 'calculate1',
            label: 'Kalkulert verdi',
          }),
          dataGrid({
            key: 'datagrid',
            label: 'Datagrid',
            components: [
              number({
                key: 'tall1',
                label: 'Grid',
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
          }),
          number({
            key: 'desimal2',
            label: 'Desimal 2',
          }),
          number({
            key: 'calculate2',
            label: 'Kalkulert verdi',
          }),
          dataGrid({
            key: 'datagrid2',
            label: 'Datagrid',
            components: [
              number({
                key: 'desimal3',
                label: 'Desimalgrid',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testingnumber', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const numberDeprecatedTranslations = () => getMockTranslationsFromForm(numberDeprecatedForm());

export { numberDeprecatedForm, numberDeprecatedTranslations };
