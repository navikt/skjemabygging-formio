import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLimitToEarliestLatest = (): Component => ({
  type: 'panel',
  key: 'limitToEarliestLatest',
  label: '',
  title: 'Begrens dato til tidligst/senest en spesifikk dato',
  input: false,
  components: [
    {
      type: 'navDatepicker',
      label: 'Tidligst tillatt dato',
      key: 'specificEarliestAllowedDate',
      input: true,
    },
    {
      type: 'navDatepicker',
      label: 'Senest tillatt dato',
      key: 'specificLatestAllowedDate',
      input: true,
    },
  ],
});

export default editFormLimitToEarliestLatest;
