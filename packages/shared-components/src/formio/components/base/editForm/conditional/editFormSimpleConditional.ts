import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { Utils } from 'formiojs';
import getContextComponents = Utils.getContextComponents;

const editFormSimpleConditional = (): Component => {
  return {
    type: 'panel',
    title: 'Enkel betinget visning',
    key: 'simple-conditional',
    label: '',
    theme: 'default',
    components: [
      {
        type: 'select',
        label: 'Denne komponenten skal vises:',
        key: 'conditional.show',
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
        dataSrc: 'custom',
        valueProperty: 'value',
        data: {
          custom(context) {
            return getContextComponents(context);
          },
        },
      },
      {
        type: 'textfield',
        label: 'Har verdien:',
        key: 'conditional.eq',
      },
    ],
  };
};

export default editFormSimpleConditional;
