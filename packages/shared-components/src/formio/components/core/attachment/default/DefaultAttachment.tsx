import NavAttachment from '../../../../../components/attachment/Attachment';
import { ComponentUtilsProvider } from '../../../../../context/component/componentUtilsContext';
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

  /**
   * If the component has values, we need to convert them to attachmentValues
   *
   * When we no longer need to support the old attachments with type radiopanel
   * and have none with type attachment and values, we can remove this.
   */
  init() {
    super.init();

    if (!this.component?.attachmentValues && this.component?.values) {
      this.component.attachmentValues = {};
      for (const objectValue of this.component.values) {
        if (
          objectValue.value === 'leggerVedNaa' ||
          objectValue.value === 'ettersender' ||
          objectValue.value === 'levertTidligere' ||
          objectValue.value === 'nei'
        ) {
          this.component.attachmentValues[objectValue.value] = {
            enabled: !!objectValue.value,
          };
        }
      }
    }
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
      <ComponentUtilsProvider component={this}>
        <NavAttachment
          value={this.getValue()}
          attachmentValues={this.getAttachmentValues()}
          title={<Label component={this.component} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          deadline={this.options.properties?.ettersendelsesfrist}
          error={this.getError()}
          onChange={(value) => this.handleChange(value)}
          translate={this.translate.bind(this)}
          ref={(ref) => this.setReactInstance(ref)}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default DefaultAttachment;
