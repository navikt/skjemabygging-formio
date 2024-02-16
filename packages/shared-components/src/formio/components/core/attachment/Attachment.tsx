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

  getValues() {
    return this.component?.values;
  }

  getAttachmentValues() {
    return this.component?.attachmentValues;
  }

  handleChange(value, flags) {
    super.updateValue(value, flags);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <NavAttachment
        values={this.getValues()}
        value={this.getValue()}
        attachmentValues={this.getAttachmentValues()}
        title={this.getLabel()}
        description={this.getDescription()}
        error={this.getError()}
        onChange={(value) => {
          this.handleChange(value, { modified: true });
        }}
        translate={this.t.bind(this)}
      />,
    );
  }
}

export default Attachment;
