import NavAttachment from '../../../../../components/attachment/Attachment';
import BaseComponent from '../../../base/BaseComponent';
import Description from '../../../base/components/Description';
import Label from '../../../base/components/Label';
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
        title={
          <Label
            component={this.component}
            translate={this.translate.bind(this)}
            options={this.options}
            builderMode={this.builderMode}
            editFields={this.editFields}
          />
        }
        description={<Description component={this.component} translate={this.translate.bind(this)} />}
        deadline={this.options.properties?.ettersendelsesfrist}
        error={this.getError()}
        onChange={(value) => this.handleChange(value)}
        translate={this.translate.bind(this)}
        ref={(ref) => this.setReactInstance(ref)}
      />,
    );
  }
}

export default DefaultAttachment;
