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

  renderReact(element) {
    element.render(
      <NavAlert
        id={this.getId()}
        ref={(ref) => this.setReactInstance(ref)}
        variant={this.getAlertType()}
        inline={this.getIsinline()}
        fullWidth={false} // Removes border-radius if true
        size="medium"
      >
        {this.getContent()}
      </NavAlert>,
    );
  }
}

export default Alert;
