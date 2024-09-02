import { AlertProps, Alert as NavAlert } from '@navikt/ds-react';
import Field from 'formiojs/components/_classes/field/Field';
import InnerHtml from '../../../../components/inner-html/InnerHtml';
import BaseComponent from '../../base/BaseComponent';
import DiffTag from '../../base/components/DiffTag';
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

  getAlertType(): AlertProps['variant'] {
    const alertTypeMap = {
      info: 'info',
      suksess: 'success',
      advarsel: 'warning',
      feil: 'error',
    };

    if (!this.component?.alerttype) return 'info';

    return alertTypeMap[this.component?.alerttype] ?? this.component?.alerttype;
  }

  getIsinline() {
    return this.component?.isInline ?? false;
  }

  renderReact(element) {
    element.render(
      <div>
        {this.getTextDisplayTag()}
        <DiffTag
          component={this.component}
          options={this.options}
          builderMode={this.builderMode}
          editFields={this.getEditFields()}
        />
        <NavAlert
          id={this.getId()}
          variant={this.getAlertType()}
          inline={this.getIsinline()} // Removes background if true
          fullWidth={false} // Removes border-radius if true
          size="medium"
        >
          <InnerHtml content={this.getContent()} className={'alertContent'} />
        </NavAlert>
      </div>,
    );
  }
}

export default Alert;
