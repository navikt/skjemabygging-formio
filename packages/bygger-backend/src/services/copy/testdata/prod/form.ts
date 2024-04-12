import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

const form: NavFormType = {
  _id: 'prod-id',
  path: 'nav123456',
  title: 'Prod form title',
  components: [
    {
      type: 'panel',
      key: 'panel1',
    },
    {
      type: 'panel',
      key: 'panel2',
    },
  ],
  properties: {
    tema: 'BIL',
  },
} as NavFormType;

export default form;
