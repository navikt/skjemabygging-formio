import FormioPanel from 'formiojs/components/panel/Panel';
import resolveFormioDefault from '../../base/resolveFormioDefault';
import panelForm from './Panel.form';

const PanelBase = resolveFormioDefault(FormioPanel);

class Panel extends PanelBase {
  static schema() {
    return PanelBase.schema();
  }

  static editForm() {
    return panelForm();
  }
}

export default Panel;
