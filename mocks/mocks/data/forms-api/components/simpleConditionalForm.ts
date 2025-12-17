import { checkbox, dataGrid, formGroup, panel, textField } from '../../../form-builder/components';
import container from '../../../form-builder/components/group/container';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const simpleConditionalForm = () => {
  const formNumber = 'simpleConditional';

  return form({
    title: 'Enkel betinget visning',
    formNumber: formNumber,
    path: 'simpleconditional',
    components: [
      panel({
        title: 'Panel 1',
        components: [
          ...parentComponents('1'),
          textField({
            label: 'Tekstfelt 1',
            conditional: {
              eq: 'true',
              show: true,
              when: 'checkbox1',
            },
          }),
          textField({
            label: 'Tekstfelt skjult når avkrysset',
            conditional: {
              eq: 'true',
              show: false,
              when: 'checkbox1',
            },
          }),
        ],
      }),
      panel({
        title: 'Panel 2 med beholder',
        components: [
          ...parentComponents('2'),
          container({
            label: 'Beholder',
            key: 'beholder',
            components: [...childComponents('2', 'beholder')],
          }),
        ],
      }),
      panel({
        title: 'Panel 3 med repeterende data',
        components: [
          ...parentComponents('3'),
          dataGrid({
            label: 'Repeterende data',
            key: 'repeterende',
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
            key: 'skjemagruppe',
            components: [...childComponents('4', 'skjemagruppe')],
          }),
        ],
      }),
      panel({
        title: 'Panel 5 med mange nivåer',
        components: [
          dataGrid({
            label: 'Repeterende data, 1 nivå',
            key: 'datagrid5',
            components: [
              container({
                label: 'Beholder, 2 nivå',
                key: 'datagrid5container',
                components: [
                  checkbox({
                    label: 'Vis tekstfelt 5',
                    key: 'checkbox5',
                  }),
                  textField({
                    label: 'Tekstfelt 5',
                    conditional: {
                      eq: 'true',
                      show: true,
                      when: 'datagrid5.datagrid5container.checkbox5',
                    },
                  }),
                  dataGrid({
                    label: 'Repeterende data, 3 nivå',
                    key: 'datagrid5containerdatagrid',
                    components: [
                      checkbox({
                        label: 'Vis tekstfelt 5, nivå 3',
                        key: 'checkbox5datagrid',
                      }),
                      // This is always hidden, when conditon is valid
                      textField({
                        label: 'tekstfelt 5, styrt fra nivå 2',
                        conditional: {
                          eq: 'true',
                          show: true,
                          when: 'datagrid5.datagrid5container.checkbox5',
                        },
                      }),
                      textField({
                        label: 'Tekstfelt 5, nivå 3',
                        conditional: {
                          eq: 'true',
                          show: true,
                          when: 'checkbox5datagrid',
                        },
                      }),
                      textField({
                        label: 'Tekstfelt 5, nivå 3 med full path',
                        conditional: {
                          eq: 'true',
                          show: true,
                          when: 'datagrid5.datagrid5container.datagrid5containerdatagrid.checkbox5datagrid',
                        },
                      }),
                    ],
                  }),
                ],
              }),
            ],
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
      conditional: {
        eq: 'true',
        show: true,
        when: `checkbox${id}`,
      },
    }),
    checkbox({
      label: `Vis tekstfelt ${id}-1 i ${name}`,
      key: `checkbox${id}${name}`,
    }),
    textField({
      label: `Tekstfelt ${id}-1 i ${name}`,
      conditional: {
        eq: 'true',
        show: true,
        when: `checkbox${id}${name}`,
      },
    }),
    textField({
      label: `Tekstfelt ${id}-1 i ${name}, med nivå`,
      conditional: {
        eq: 'true',
        show: true,
        when: `${name}.checkbox${id}${name}`,
      },
    }),
  ];
};

const simpleConditionalTranslations = () => {
  return getMockTranslationsFromForm(simpleConditionalForm());
};

export { simpleConditionalForm, simpleConditionalTranslations };
