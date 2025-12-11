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
        title: 'Panel 1',
        components: [
          ...parentComponents('1'),
          textField({
            label: 'Tekstfelt 1',
            customConditional: 'show = row.checkbox1',
          }),
          textField({
            label: 'Tekstfelt skjult når avkrysset',
            customConditional: 'show = !row.checkbox1',
          }),
        ],
      }),
      panel({
        title: 'Panel 2 med beholder',
        components: [
          ...parentComponents('2'),
          container({
            label: 'Beholder',
            components: [...childComponents('2', 'beholder')],
          }),
        ],
      }),
      panel({
        title: 'Panel 3 med repeterende data',
        components: [
          ...parentComponents('3'),
          dataGrid({
            label: 'Repeterende',
            components: [...childComponents('3', 'repeterende')],
          }),
        ],
      }),
      panel({
        title: 'Panel 4 med skjemagruppe',
        components: [
          ...parentComponents('4'),
          formGroup({
            label: 'Skjemagruppe',
            components: [...childComponents('4', 'skjemagruppe')],
          }),
        ],
      }),
    ],
  });
};

const parentComponents = (id: string) => {
  return [
    checkbox({
      label: `Vis tekstfelt ${id}`,
      key: `checkbox${id}`,
    }),
  ];
};

const childComponents = (id: string, name: string) => {
  return [
    textField({
      label: `Tekstfelt ${id} i ${name}`,
      customConditional: `show = row.checkbox${id}`,
    }),
    checkbox({
      label: `Vis tekstfelt ${id}-1 i ${name}`,
      key: `checkbox${id}${name}`,
    }),
    textField({
      label: `Tekstfelt ${id}-1 i ${name}`,
      customConditional: `show = row.checkbox${id}${name}`,
    }),
  ];
};

const conditionalRowTranslations = () => {
  return getMockTranslationsFromForm(conditionalRowForm());
};

export { conditionalRowForm, conditionalRowTranslations };
