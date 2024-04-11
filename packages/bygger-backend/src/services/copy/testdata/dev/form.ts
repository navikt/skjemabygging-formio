import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

const form: NavFormType = {
  path: 'nav123456',
  title: 'Prod form title',
  components: [
    {
      type: 'panel',
      key: 'panel1',
    },
  ],
  properties: {
    tema: 'ARB',
  },
  project: 'devproject',
} as NavFormType;

export default form;
