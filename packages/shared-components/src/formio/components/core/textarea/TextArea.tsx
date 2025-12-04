import { Textarea as NavTextarea } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import textAreaBuilder from './TextArea.builder';
import textAreaForm from './TextArea.form';

const { navTextarea: TRANSLATIONS } = TEXTS.grensesnitt;

class TextArea extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Tekstområde',
      type: 'textarea',
      key: 'textarea',
      autoExpand: true,
      editor: '',
    });
  }

  static editForm() {
    return textAreaForm();
  }

  static get builderInfo() {
    return textAreaBuilder();
  }

  getMinRows() {
    return this.component?.rows;
  }

  getMaxRows() {
    return !this.component?.autoExpand ? this.getMinRows() : undefined;
  }

  getMaxLength() {
    const maxLength = this.component?.validate?.maxLength;
    return maxLength;
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavTextarea
          id={this.getId()}
          defaultValue={this.getValue()}
          maxLength={this.getMaxLength()}
          minRows={this.getMinRows()}
          maxRows={this.getMaxRows()}
          ref={(ref) => this.setReactInstance(ref)}
          onChange={(event) => this.handleChange(event.currentTarget.value)}
          label={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          hideLabel={this.getHideLabel()}
          description={<Description component={this.component} />}
          className={this.getClassName()}
          autoComplete={this.getAutoComplete()}
          readOnly={this.getReadOnly()}
          spellCheck={this.getSpellCheck()}
          error={this.getError()}
          i18n={{
            counterLeft: this.translate(TRANSLATIONS.counterLeft),
            counterTooMuch: this.translate(TRANSLATIONS.counterTooMuch),
          }}
        />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default TextArea;
