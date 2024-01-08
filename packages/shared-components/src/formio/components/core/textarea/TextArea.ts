import FormioTextArea from 'formiojs/components/textarea/TextArea';
import textAreaForm from './TextArea.form';

class TextArea extends FormioTextArea {
  static schema() {
    return FormioTextArea.schema({
      label: 'Tekstområde',
      type: 'textarea',
      key: 'textarea',
      fieldSize: 'input--xxl',
      input: true,
      dataGridLabel: true,
      clearOnHide: true,
      autoExpand: true,
    });
  }

  static editForm() {
    return textAreaForm();
  }
}

export default TextArea;
