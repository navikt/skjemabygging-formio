import { createSurname } from '@navikt/skjemadigitalisering-shared-domain';
import Surname from './Surname';

const surnameBuilder = (keyPostfix = '') => {
  const schema = Surname.schema();
  const definition = createSurname();

  return {
    title: schema.label,
    schema: {
      ...schema,
      ...definition,
      key: `${definition.key}${keyPostfix}`,
    },
  };
};

export default surnameBuilder;
