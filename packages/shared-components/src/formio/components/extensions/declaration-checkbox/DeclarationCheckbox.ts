import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import Checkbox from '../../core/checkbox/Checkbox';
import declarationCheckboxBuilder from './DeclarationCheckbox.builder';

class DeclarationCheckbox extends Checkbox {
  static schema() {
    return {
      ...super.schema(),
      label: TEXTS.statiske.declaration.standardCheckboxLabel,
      key: 'jegVilSvareSaGodtJegKanPaSporsmaleneISoknaden',
      type: 'navCheckbox',
      description: TEXTS.statiske.declaration.standardCheckboxDescription,
    };
  }

  static get builderInfo() {
    return declarationCheckboxBuilder();
  }
}

export default DeclarationCheckbox;
