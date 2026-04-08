import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormSenderRole = (): Component => ({
  type: 'radiopanel',
  key: 'senderRole',
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

export default editFormSenderRole;
