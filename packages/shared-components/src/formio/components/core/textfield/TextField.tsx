import { TextField as NavTextField } from '@navikt/ds-react';
import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import textFieldBuilder from './TextField.builder';
import textFieldForm from './TextField.form';

class TextField extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Tekstfelt',
      type: 'textfield',
      key: 'tekstfelt',
      spellcheck: true,
      inputType: 'text',
    });
  }

  static editForm() {
    return textFieldForm();
  }

  static get builderInfo() {
    return textFieldBuilder();
  }

  getValue() {
    return super.getValue() ?? '';
  }

  getInputMode(): InputMode {
    return 'text';
  }

  isProtected(): boolean {
    return !!this.component?.protected;
  }

  handleChange(value: string | number) {
    super.handleChange(value);
  }

  renderReact(element) {
    element.render(
      <NavTextField
        id={this.getId()}
        defaultValue={this.getValue()}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.handleChange(event.currentTarget.value)}
        label={
          <Label
            component={this.component}
            translate={this.translate.bind(this)}
            options={this.options}
            builderMode={this.builderMode}
            editFields={this.editFields}
          />
        }
        hideLabel={this.getHideLabel()}
        description={<Description component={this.component} translate={this.translate.bind(this)} />}
        className={this.getClassName()}
        autoComplete={this.getAutoComplete()}
        readOnly={this.getReadOnly()}
        spellCheck={this.getSpellCheck()}
        error={this.getError()}
        inputMode={this.getInputMode()}
        type={this.isProtected() ? 'password' : 'text'}
      />,
    );
  }
}

export default TextField;
