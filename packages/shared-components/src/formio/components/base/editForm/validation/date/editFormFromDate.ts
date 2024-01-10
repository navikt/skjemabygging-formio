import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { Utils } from 'formiojs';
import getContextComponents = Utils.getContextComponents;

const editFormFromDate = (): Component => ({
  type: 'panel',
  key: 'fromDate',
  label: '',
  title: 'Fra-til-dato',
  components: [
    {
      type: 'select',
      input: true,
      label: 'Datofelt for fra-dato',
      key: 'beforeDateInputKey',
      dataSrc: 'custom',
      valueProperty: 'value',
      data: {
        custom(context) {
          return getContextComponents(context);
        },
      },
    },
    {
      type: 'checkbox',
      label: 'Kan være lik',
      key: 'mayBeEqual',
      defaultValue: false,
      input: true,
    },
  ],
});

export default editFormFromDate;
