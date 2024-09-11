import { InputMode, numberUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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

  getNumberFormatOptions(): Intl.NumberFormatOptions {
    return { minimumIntegerDigits: 4, maximumSignificantDigits: 4, maximumFractionDigits: 0, useGrouping: false };
  }

  getInputMode(): InputMode {
    return this.component?.inputType || 'numeric';
  }

  getMinYear() {
    return this.component?.validate?.minYear;
  }

  getMaxYear() {
    return this.component?.validate?.maxYear;
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const errorMessage = this.validateYear();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }

    return validity;
  }

  private validateYear() {
    // Get data value instead of formatted number from this.getValue()
    const value = this.getDataValue();

    if (value === '' || value === undefined) {
      return;
    }

    if (`${value}`.length !== 4) {
      return this.translateWithLabel(TEXTS.validering.yearLength);
    }

    if (!numberUtils.isBiggerOrEqualMin(value, this.getMinYear())) {
      return this.translateWithLabel(TEXTS.validering.minYear, {
        minYear: numberUtils.toLocaleString(this.getMinYear(), this.getNumberFormatOptions()),
      });
    }

    if (!numberUtils.isSmallerOrEqualMax(value, this.getMaxYear())) {
      return this.translateWithLabel(TEXTS.validering.maxYear, {
        maxYear: numberUtils.toLocaleString(this.getMaxYear(), this.getNumberFormatOptions()),
      });
    }
  }

  replaceCommasAndSpaces(value: string): string {
    return value?.replace(/\s/g, '');
  }
}

export default Year;
