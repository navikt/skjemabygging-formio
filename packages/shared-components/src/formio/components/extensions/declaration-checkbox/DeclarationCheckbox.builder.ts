import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import Checkbox from '../../core/checkbox/Checkbox';

const declarationCheckbox = () => {
  const schema = Checkbox.schema();
  return {
    title: 'Standard erklæring',
    schema: {
      ...schema,
      label: TEXTS.statiske.declaration.standardCheckboxLabel,
      key: 'jegVilSvareSaGodtJegKanPaSporsmaleneISoknaden',
      description: TEXTS.statiske.declaration.standardCheckboxDescription,
      validate: {
        required: true,
      },
    },
  };
};

export default declarationCheckbox;
