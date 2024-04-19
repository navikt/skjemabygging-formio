import NavAttachment from '../../../../../components/attachment/Attachment';
import BaseComponent from '../../../base/BaseComponent';
import otherAttachmentBuilder from './OtherAttachment.builder';
import otherAttachmentForm from './OtherAttachment.form';

class OtherAttachment extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Annen dokumentasjon',
      description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
      type: 'otherAttachment', // For review: This needs to be its own type it seems? If not we can't separate the "otherAttachmentForm" and "defaultAttachmentForm"
      key: 'annenDokumentasjon',
      dataSrc: 'values',
    });
  }

  static editForm() {
    return otherAttachmentForm();
  }

  static get builderInfo() {
    return otherAttachmentBuilder();
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

export default OtherAttachment;
