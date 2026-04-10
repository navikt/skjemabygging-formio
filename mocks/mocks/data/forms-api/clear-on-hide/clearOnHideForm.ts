import { checkbox, container, panel, textField, dataGrid } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';
import { attachmentsForm } from '../attachmentsForm';

const clearOnHideForm = () => {
  const formNumber = 'clearonhide';
  return form({
    title: 'Test clear on hide',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Basic',
        components: [
          checkbox({ label: 'Show TextField', key: 'basic-checkbox' }),
          textField({
            label: 'TextField',
            key: 'basic-textfield',
            conditional: {
              eq: 'true',
              show: true,
              when: 'basic-checkbox',
            },
          }),
        ],
      }),
      panel({
        title: 'Within Container',
        components: [
          checkbox({ label: 'Show TextField in Container', key: 'container-checkbox' }),
          container({
            conditional: {
              eq: 'true',
              show: true,
              when: 'container-checkbox',
            },
            components: [
              textField({
                label: 'TextField',
                key: 'container-textfield',
              }),
            ],
          }),
        ],
      }),
      panel({
        title: 'Within DataGrid',
        components: [
          checkbox({ label: 'Show TextField in DataGrid', key: 'datagrid-checkbox' }),
          dataGrid({
            conditional: {
              eq: 'true',
              show: true,
              when: 'datagrid-checkbox',
            },
            components: [
              textField({
                label: 'TextField',
                key: 'datagrid-textfield',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber }),
  });
};

const clearOnHideTranslations = () => {
  return getMockTranslationsFromForm(attachmentsForm());
};

export { clearOnHideForm, clearOnHideTranslations };
