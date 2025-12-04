import NavAttachment from '../../../../../components/attachment/Attachment';
import { ComponentUtilsProvider } from '../../../../../context/component/componentUtilsContext';
import BaseComponent from '../../../base/BaseComponent';
import AdditionalDescription from '../../../base/components/AdditionalDescription';
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

    if (this.builderMode && !this.component?.attachmentValues && this.component?.values) {
      if (!this.component?.attachmentType) {
        this.component.attachmentType = this.component?.otherDocumentation ? 'other' : 'default';
      }

      if (this.component.attachmentType === 'other') {
        this.component.attachmentValues = {
          leggerVedNaa: { enabled: true },
          nei: { enabled: true },
        };
      } else {
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

      this.component.otherDocumentation = undefined;
      this.component.values = undefined;
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
          title={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          deadline={this.options.properties?.ettersendelsesfrist}
          error={this.getError()}
          onChange={(value) => this.handleChange(value)}
          translate={this.translate.bind(this)}
          ref={(ref) => this.setReactInstance(ref)}
        />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default DefaultAttachment;
