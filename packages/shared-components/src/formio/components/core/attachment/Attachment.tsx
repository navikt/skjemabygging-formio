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

  getAttachmentValues() {
    return this.component?.attachmentValues ? this.component?.attachmentValues : this.component?.values;
  }

  handleChange(value, flags) {
    super.updateValue(value, flags);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <NavAttachment
        value={this.getValue()}
        attachmentValues={this.getAttachmentValues()}
        title={this.getLabel()}
        description={this.getDescription()}
        deadline={this.options.properties?.ettersendelsesfrist}
        error={this.getError()}
        onChange={(value) => {
          this.handleChange(value, { modified: true });
        }}
        translate={this.t.bind(this)}
        ref={(ref) => this.setReactInstance(ref)}
      />,
    );
  }
}

export default Attachment;
