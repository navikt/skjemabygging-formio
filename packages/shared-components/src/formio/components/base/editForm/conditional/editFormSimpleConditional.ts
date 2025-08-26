import { Utils } from '@formio/js';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import getContextComponents = Utils.getContextComponents;

const editFormSimpleConditional = (): Component => {
  return {
    type: 'panel',
    title: 'Enkel betinget visning',
    key: 'simple-conditional',
    label: '',
    theme: 'default',
    input: false,
    components: [
      {
        type: 'select',
        label: 'Denne komponenten skal vises:',
        key: 'conditional.show',
        input: true,
        dataSrc: 'values',
        data: {
          values: [
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
          ],
        },
      },
      {
        type: 'select',
        label: 'Når følgende komponent:',
        key: 'conditional.when',
        input: true,
        dataSrc: 'custom',
        valueProperty: 'value',
        data: {
          custom(context) {
            return getContextComponents(context, false);
          },
        },
      },
      {
        type: 'textfield',
        label: 'Har verdien:',
        key: 'conditional.eq',
        input: true,
      },
    ],
  };
};

export default editFormSimpleConditional;
