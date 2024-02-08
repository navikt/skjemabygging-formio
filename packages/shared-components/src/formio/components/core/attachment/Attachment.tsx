import NavAttachment from '../../../../components/attachment/Attachment';
import BaseComponent from '../../base/BaseComponent';
import attachmentBuilder from './Attachment.builder';
import attachmentForm from './Attachment.form';

class Attachment extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Vedlegg',
      type: 'attachment',
      key: 'vedlegg',
      dataSrc: 'values',
    });
  }

  static editForm() {
    return attachmentForm();
  }

  static get builderInfo() {
    return attachmentBuilder();
  }

  renderReact(element) {
    element.render(
      <NavAttachment
        values={this.component?.values}
        attachmentValues={this.component?.attachmentValues}
        title={this.getLabel()}
        description={this.getDescription()}
        error={this.getError()}
        onChange={(value) => {
          this.updateValue(value, { modified: true });
        }}
      />,
    );
  }
}

export default Attachment;
