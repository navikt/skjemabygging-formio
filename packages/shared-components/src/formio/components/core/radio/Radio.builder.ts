import { createRadioPanel } from '@navikt/skjemadigitalisering-shared-domain';
import Radio from './Radio';

const radioBuilder = () => {
  const schema = Radio.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      ...createRadioPanel(),
    },
  };
};

export default radioBuilder;
