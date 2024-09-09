import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import Number from '../number/Number';
import yearBuilder from './Year.builder';
import yearForm from './Year.form';

class Year extends Number {
  static schema() {
    return BaseComponent.schema({
      label: 'Årstall',
      type: 'year',
      key: 'aarstall',
      inputType: 'numeric',
      fieldSize: 'input--xs',
    });
  }

  static editForm() {
    return yearForm();
  }

  static get builderInfo() {
    return yearBuilder();
  }

  getInputMode(): InputMode {
    return this.component?.inputType || 'numeric';
  }
}

export default Year;
