import { createNationalIdentityNumber } from '@navikt/skjemadigitalisering-shared-domain';
import NationalIdentityNumber from './NationalIdentityNumber';

const nationalIdentityNumberBuilder = (keyPostfix: string = '') => {
  const schema = NationalIdentityNumber.schema();
  const definition = createNationalIdentityNumber();
  return {
    title: 'Fødselsnummer',
    schema: {
      ...schema,
      ...definition,
      key: `${definition.key}${keyPostfix}`,
    },
  };
};

export default nationalIdentityNumberBuilder;
