import { dataGrid, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const dataGridForm = () => {
  const formNumber = 'datagrid';

  return form({
    title: 'DataGrid component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          dataGrid({
            label: 'Repeterende data',
            key: 'datagrid1',
            description: '<p>Beskrivelse av tabellen</p>',
            rowTitle: 'Rad',
            addAnother: 'Legg til rad',
            removeAnother: 'Fjern rad',
            components: [textField({ label: 'Navn' })],
          }),
          dataGrid({
            label: 'Standard knapper',
            key: 'datagrid2',
            components: [textField({ label: 'Verdi' })],
          }),
        ],
      }),
    ],
  });
};

const dataGridTranslations = () => getMockTranslationsFromForm(dataGridForm());

export { dataGridForm, dataGridTranslations };
