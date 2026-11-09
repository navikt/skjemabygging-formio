import { createFirstName } from '@navikt/skjemadigitalisering-shared-domain';
import FirstName from './FirstName';

const firstNameBuilder = (keyPostfix = '') => {
  const schema = FirstName.schema();
  const definition = createFirstName();

  return {
    title: schema.label,
    schema: {
      ...schema,
      ...definition,
      key: `${definition.key}${keyPostfix}`,
    },
  };
};

export default firstNameBuilder;
