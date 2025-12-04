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
          checkbox({
            label: 'Trykk her',
            key: 'checkbox1',
          }),
          textField({
            label: 'Tekstfelt 1',
            conditional: {
              eq: 'true',
              show: true,
              when: 'checkbox1',
            },
          }),
          textField({
            label: 'Tekstfelt 1 - skjult når avkrysset',
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
          container({
            label: 'Beholder',
            components: [
              checkbox({
                label: 'Trykk her',
                key: 'checkbox2',
              }),
              textField({
                label: 'Tekstfelt 2',
                conditional: {
                  eq: 'true',
                  show: true,
                  when: 'checkbox2',
                },
              }),
            ],
          }),
        ],
      }),
      panel({
        title: 'Panel 3 med repeterende data',
        components: [
          checkbox({
            label: 'Trykk her (3)',
            key: 'checkbox3',
          }),
          dataGrid({
            label: 'Repeterende data',
            key: 'datagrid',
            components: [
              checkbox({
                label: 'Trykk her (3-1)',
                key: 'checkbox3-1',
              }),
              textField({
                label: 'Tekstfelt 3',
                conditional: {
                  eq: 'true',
                  show: true,
                  when: 'checkbox3',
                },
              }),
              textField({
                label: 'Tekstfelt 3-1',
                conditional: {
                  eq: 'true',
                  show: true,
                  when: 'checkbox3-1',
                },
              }),
              textField({
                label: 'Tekstfelt 3-1, med nivå',
                conditional: {
                  eq: 'true',
                  show: true,
                  when: 'datagrid.checkbox3-1',
                },
              }),
            ],
            conditional: {
              eq: 'true',
              show: true,
              when: 'checkbox3',
            },
          }),
          dataGrid({
            label: 'Repeterende data, flere nivåer',
            key: 'datagrid-nested1',
            components: [
              container({
                label: 'Beholder i datagrid',
                key: 'container-nested',
                components: [
                  checkbox({
                    label: 'Trykk her (3-2)',
                    key: 'checkbox3-2',
                  }),
                  textField({
                    label: 'Tekstfelt 3-2',
                    conditional: {
                      eq: 'true',
                      show: true,
                      when: 'datagrid-nested1.container-nested.checkbox3-2',
                    },
                  }),
                  dataGrid({
                    label: 'Repeterende data nivå 2',
                    key: 'datagrid-nested2',
                    components: [
                      checkbox({
                        label: 'Trykk her (3-2-1)',
                        key: 'checkbox3-2-1',
                      }),
                      textField({
                        label: 'Tekstfelt 3-2 (alltid skjult)',
                        conditional: {
                          eq: 'true',
                          show: true,
                          // This is valid when in formio on the parent container, but not here.
                          // Not sure why, but this is allways hidden in formio.
                          when: 'datagrid-nested1.container-nested.checkbox3-2',
                        },
                      }),
                      textField({
                        label: 'Tekstfelt 3-2-1',
                        conditional: {
                          eq: 'true',
                          show: true,
                          when: 'checkbox3-2-1',
                        },
                      }),
                      textField({
                        label: 'Tekstfelt 3-2-1, med nivå',
                        conditional: {
                          eq: 'true',
                          show: true,
                          when: 'datagrid-nested1.container-nested.datagrid-nested2.checkbox3-2-1',
                        },
                      }),
                    ],
                    conditional: {
                      eq: 'true',
                      show: true,
                      when: 'datagrid-nested1.container-nested.checkbox3-2',
                    },
                  }),
                ],
              }),
            ],
            conditional: {
              eq: 'true',
              show: true,
              when: 'checkbox3',
            },
          }),
        ],
      }),
      panel({
        title: 'Panel 4 med skjemagruppe',
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
                conditional: {
                  eq: 'true',
                  show: true,
                  when: 'checkbox4',
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

const simpleConditionalTranslations = () => {
  return getMockTranslationsFromForm(simpleConditionalForm());
};

export { simpleConditionalForm, simpleConditionalTranslations };
