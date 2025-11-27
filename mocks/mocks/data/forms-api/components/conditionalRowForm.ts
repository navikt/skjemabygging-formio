import { checkbox, dataGrid, formGroup, panel, textField } from '../../../form-builder/components';
import container from '../../../form-builder/components/group/container';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const conditionalRowForm = () => {
  const formNumber = 'conditionalRow';

  return form({
    title: 'Betinget visning med sjekk på row',
    formNumber: formNumber,
    path: 'conditionalrow',
    components: [
      panel({
        title: 'Panel',
        components: [
          checkbox({
            label: 'Trykk her',
            key: 'checkbox1',
          }),
          textField({
            label: 'Tekstfelt 1',
            customConditional: 'show = row.checkbox1',
          }),
        ],
      }),
      panel({
        title: 'Panel med beholder',
        components: [
          container({
            label: 'Datagrid',
            components: [
              checkbox({
                label: 'Trykk her',
                key: 'checkbox2',
              }),
              textField({
                label: 'Tekstfelt 2',
                customConditional: 'show = row.checkbox2',
              }),
            ],
          }),
        ],
      }),
      panel({
        title: 'Panel med repeterende data',
        components: [
          dataGrid({
            label: 'Repeterende data',
            components: [
              checkbox({
                label: 'Trykk her',
                key: 'checkbox3',
              }),
              textField({
                label: 'Tekstfelt 3',
                customConditional: 'show = row.checkbox3',
              }),
            ],
          }),
        ],
      }),
      panel({
        title: 'Panel med skjemagruppe',
        components: [
          formGroup({
            label: 'Skjemagruppe',
            components: [
              checkbox({
                label: 'Trykk her',
                key: 'checkbox4',
              }),
              textField({
                label: 'Tekstfelt 4',
                customConditional: 'show = row.checkbox4',
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

const conditionalRowTranslations = () => {
  return getMockTranslationsFromForm(conditionalRowForm());
};

export { conditionalRowForm, conditionalRowTranslations };
