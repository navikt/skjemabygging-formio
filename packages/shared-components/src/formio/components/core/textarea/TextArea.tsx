import { Textarea as NavTextarea } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
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
      <>
        <NavTextarea
          id={this.getId()}
          defaultValue={this.getValue()}
          maxLength={this.getMaxLength()}
          minRows={this.getMinRows()}
          maxRows={this.getMaxRows()}
          ref={(ref) => this.setReactInstance(ref)}
          onChange={(event) => this.updateValue(event.currentTarget.value, { modified: true })}
          label={this.getLabel()}
          hideLabel={this.getHideLabel()}
          description={this.getDescription()}
          className={this.getClassName()}
          autoComplete={this.getAutoComplete()}
          readOnly={this.getReadOnly()}
          spellCheck={this.getSpellCheck()}
          error={this.getError()}
          i18n={{
            counterLeft: this.t(TRANSLATIONS.counterLeft),
            counterTooMuch: this.t(TRANSLATIONS.counterTooMuch),
          }}
        />
      </>,
    );
  }
}

export default TextArea;
