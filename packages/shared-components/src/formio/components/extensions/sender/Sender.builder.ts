import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import Sender from './Sender';

const senderBuilder = (component?: Partial<Component>) => {
  const schema = Sender.schema();

  return {
    title: component?.label ?? schema.label,
    schema: {
      ...schema,
      validate: {
        required: true,
      },
      ...component,
    },
  };
};

export default senderBuilder;
