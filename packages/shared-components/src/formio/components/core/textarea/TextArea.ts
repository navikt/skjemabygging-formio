import FormioTextArea from 'formiojs/components/textarea/TextArea';
import textAreaForm from './TextArea.form';

class TextArea extends FormioTextArea {
  static editForm() {
    return textAreaForm();
  }
}

export default TextArea;
