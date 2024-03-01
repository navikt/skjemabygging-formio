import { Radio as AkselRadio, RadioGroup } from '@navikt/ds-react';
import FormioUtils from 'formiojs/utils';
import Ready from '../../../../util/form/ready';
import BaseComponent from '../../base/BaseComponent';
import radioBuilder from './Radio.builder';
import radioForm from './Radio.form';

class Radio extends BaseComponent {
  lastRadioRef: HTMLInputElement | null = null;
  _reactRefsReady = Ready();
  _reactRefs: {} = {};

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

  addRef(name: string, ref: any) {
    this._reactRefs[name] = ref;
  }

  getRef(name: string) {
    return this._reactRefs[name];
  }

  focus(focusData: any = {}) {
    Promise.all([this.reactReady, this._reactRefsReady.promise]).then(() => {
      const { focusedValue } = focusData;
      if (focusedValue) {
        const input = this.getRef(`input:${focusedValue}`);
        input?.focus();
      } else {
        this.lastRadioRef?.focus();
      }
    });
  }

  changeHandler(value, opts) {
    super.updateValue(value, opts);
    this.rerender();
  }

  onRadioFocus(value) {
    this.setFocusedComponent(this, value);
  }

  onRadioBlur(value) {
    this.root.pendingBlur = FormioUtils.delay(() => {
      const focusedComponent = this.getFocusedComponent();
      const focusedValue = this.getFocusedValue();
      if (focusedComponent === this && focusedValue === value) {
        this.setFocusedComponent(null);
      }
    });
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
            onFocus={() => this.onRadioFocus(obj.value)}
            onBlur={() => this.onRadioBlur(obj.value)}
            ref={(ref) => {
              this.addRef(`input:${obj.value}`, ref);
              if (index === arr.length - 1) {
                this.lastRadioRef = ref;
                this._reactRefsReady.resolve();
              }
            }}
          >
            {this.t(obj.label)}
          </AkselRadio>
        ))}
      </RadioGroup>,
    );
  }
}

export default Radio;
