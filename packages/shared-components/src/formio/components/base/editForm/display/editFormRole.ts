import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRole = (): Component => ({
  type: 'radiopanel',
  key: 'role',
  defaultValue: 'person',
  label: 'Rolle',
  dataSrc: 'values',
  values: [
    { label: 'Person', value: 'person' },
    { label: 'Bedrift', value: 'organization' },
  ],
  validate: {
    required: true,
  },
});

export default editFormRole;
