import { Utils } from '@formio/js';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import getContextComponents = Utils.getContextComponents;

const editFormFromDate = (): Component => ({
  type: 'panel',
  key: 'fromDate',
  label: '',
  title: 'Fra-til-dato',
  input: false,
  components: [
    {
      type: 'select',
      label: 'Datofelt for fra-dato',
      key: 'beforeDateInputKey',
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
      type: 'checkbox',
      label: 'Kan være lik',
      key: 'mayBeEqual',
      input: true,
      defaultValue: false,
    },
  ],
});

export default editFormFromDate;
