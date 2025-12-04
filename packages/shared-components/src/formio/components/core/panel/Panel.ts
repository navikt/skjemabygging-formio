import FormioPanel from 'formiojs/components/panel/Panel';
import baseComponentUtils from '../../base/baseComponentUtils';
import panelForm from './Panel.form';

class Panel extends FormioPanel {
  static schema() {
    return super.schema();
  }

  static editForm() {
    return panelForm();
  }

  init() {
    super.init();
    baseComponentUtils.setupBuilderErrors(this);
  }
}

export default Panel;
