import { createAddress } from '@navikt/skjemadigitalisering-shared-domain';
import address from './Address';

const addressBuilder = () => {
  const schema = address.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      ...createAddress(),
    },
  };
};

export default addressBuilder;
