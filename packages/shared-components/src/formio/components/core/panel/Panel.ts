import { Formio } from '@formio/js';
import panelForm from './Panel.form';

const FormioPanel = Formio.Components.components.panel;

class Panel extends FormioPanel {
  static schema() {
    return super.schema();
  }

  static editForm() {
    return panelForm();
  }
}

export default Panel;
