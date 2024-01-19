import { AlertProps, Alert as NavAlert } from '@navikt/ds-react';
import Field from 'formiojs/components/_classes/field/Field';
import BaseComponent from '../../base/BaseComponent';
import alertBuilder from './Alert.builder';
import alertForm from './Alert.form';

class Alert extends BaseComponent {
  static schema() {
    return Field.schema({
      type: 'alertstripe',
      key: 'alertstripe',
      alerttype: 'info',
      input: false,
      hideLabel: true,
    });
  }

  static editForm() {
    return alertForm();
  }

  static get builderInfo() {
    return alertBuilder();
  }

  getAlertType() {
    return (this.component?.alerttype ?? 'info') as AlertProps['variant'];
  }

  getIsinline() {
    return this.component?.isInline ?? false;
  }

  renderReact(element) {
    element.render(
      <>
        {this.getDiffTag()}
        <NavAlert
          id={this.getId()}
          variant={this.getAlertType()}
          inline={this.getIsinline()} // Removes background if true
          fullWidth={false} // Removes border-radius if true
          size="medium"
        >
          <div dangerouslySetInnerHTML={{ __html: this.t(this.getContent()) }} />
        </NavAlert>
      </>,
    );
  }
}

export default Alert;