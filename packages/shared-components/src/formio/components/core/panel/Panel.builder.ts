import { createPanel } from '@navikt/skjemadigitalisering-shared-domain';
import Panel from './Panel';

const panelBuilder = () => {
  const schema = Panel.schema();
  return {
    title: 'Tomt panel',
    schema: {
      ...schema,
      ...createPanel(),
    },
  };
};

export default panelBuilder;
