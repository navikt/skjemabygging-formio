import { Radio as AkselRadio, RadioGroup } from '@navikt/ds-react';
import Ready from '../../../../util/form/ready';
import BaseComponent from '../../base/BaseComponent';
import { blurHandler, focusHandler } from '../../base/focus-helpers';
import radioBuilder from './Radio.builder';
import radioForm from './Radio.form';

class Radio extends BaseComponent {
  _reactRefsReady = Ready();

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

  get reactRefsReady() {
    return this._reactRefsReady.promise;
  }

  focus(focusData: any = {}) {
    this.reactReady.then(() => {
      const { focusedElementName } = focusData;
      if (focusedElementName) {
        const input = this.getRef(`input:${focusedElementName}`);
        input?.focus();
      } else {
        this.reactInstance?.focus();
      }
    });
  }

  changeHandler(value, opts) {
    super.onUserUpdate(value, opts);
    this.rerender();
  }

  renderReact(element) {
    const values = this.component!.values ?? [];
    this._reactRefsReady.reset();
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
        tabIndex={-1}
      >
        {values.map((obj, index, arr) => (
          <AkselRadio
            key={obj.value}
            value={obj.value}
            onFocus={focusHandler(this, { focusedElementName: obj.value, skipEmit: true })}
            onBlur={blurHandler(this, { focusedElementName: obj.value, skipEmit: true })}
            ref={(ref) => {
              this.addRef(`input:${obj.value}`, ref);
              if (index === arr.length - 1) {
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
