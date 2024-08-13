import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormContent from '../display/editFormContent';

const editFormAccordionGrid = (): Component => ({
  key: 'accordionValues',
  type: 'datagrid',
  label: 'Trekkspill dataverdier',
  reorder: false,
  isNavDataGrid: true,
  validate: {
    custom: 'valid = data.accordionValues.length > 1 || "Trekkspillkomponenten må ha minst to rader"',
  },
  defaultValue: [
    { label: '', content: '' },
    { label: '', content: '' },
  ],
  dataSrc: 'values',
  components: [
    {
      label: 'Tittel',
      key: 'title',
      type: 'textfield',
      validate: {
        required: true,
      },
    },
    {
      ...editFormContent(),
    },
  ],
});

export default editFormAccordionGrid;
