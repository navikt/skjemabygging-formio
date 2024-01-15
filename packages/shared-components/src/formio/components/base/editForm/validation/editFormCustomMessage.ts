import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormCustomMessage = (): Component => {
  return {
    key: 'validate.customMessage',
    label: 'Custom Error Message',
    type: 'textfield',
    input: true,
  };
};

export default editFormCustomMessage;
