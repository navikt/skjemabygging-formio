import FormioPanel from 'formiojs/components/panel/Panel';
import panelForm from './Panel.form';

class Panel extends FormioPanel {
  static schema() {
    return super.schema();
  }

  static editForm() {
    return panelForm();
  }
}

export default Panel;
