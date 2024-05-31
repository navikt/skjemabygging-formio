import NavAttachment from '../../../../../components/attachment/Attachment';
import BaseComponent from '../../../base/BaseComponent';
import defaultAttachmentBuilder from './DefaultAttachment.builder';
import defaultAttachmentForm from './DefaultAttachment.form';

class DefaultAttachment extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Vedlegg',
      type: 'attachment',
      key: 'vedlegg',
      dataSrc: 'values',
    });
  }

  static editForm() {
    return defaultAttachmentForm();
  }

  static get builderInfo() {
    return defaultAttachmentBuilder();
  }

  getAttachmentValues() {
    return this.component?.attachmentValues ? this.component?.attachmentValues : this.component?.values;
  }

  handleChange(value) {
    super.handleChange(value);
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
        onChange={(value) => this.handleChange(value)}
        translate={this.t.bind(this)}
        ref={(ref) => this.setReactInstance(ref)}
      />,
    );
  }
}

export default DefaultAttachment;
