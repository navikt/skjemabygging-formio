import { Radio as AkselRadio, RadioGroup } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import radioBuilder from './Radio.builder';
import radioForm from './Radio.form';

class Radio extends BaseComponent {
  lastRadioRef: HTMLInputElement | null = null;

  static schema() {
    return BaseComponent.schema({
      label: 'Radiopanel',
      type: 'radiopanel',
      key: 'radiopanel',
      dataSrc: 'values',
      values: [
        {
          value: 'ja',
          label: 'Ja',
        },
        {
          value: 'nei',
          label: 'Nei',
        },
      ],
    });
  }

  static editForm() {
    return radioForm(Radio.schema().type);
  }

  static get builderInfo() {
    return radioBuilder();
  }

  get defaultSchema() {
    return Radio.schema();
  }

  focus() {
    if (this.lastRadioRef) {
      this.lastRadioRef.focus();
    }
  }

  changeHandler(value, opts) {
    super.updateValue(value, opts);
    this.rerender();
  }

  renderReact(element) {
    const values = this.component!.values ?? [];
    return element.render(
      <RadioGroup
        id={this.getId()}
        legend={this.getLabel()}
        value={this.getValue()}
        onChange={(value) => this.changeHandler(value, { modified: true })}
        ref={(ref) => this.setReactInstance(ref)}
        hideLegend={this.getHideLabel()}
        description={this.getDescription()}
        className={this.getClassName()}
        readOnly={this.getReadOnly()}
        spellCheck={this.getSpellCheck()}
        error={this.getError()}
      >
        {values.map((obj, index, arr) => (
          <AkselRadio
            key={obj.value}
            value={obj.value}
            {...(index === arr.length - 1 && { ref: (ref) => (this.lastRadioRef = ref) })}
          >
            {this.t(obj.label)}
          </AkselRadio>
        ))}
      </RadioGroup>,
    );
  }
}

export default Radio;
