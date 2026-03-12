import NavSender from '../../../../components/Sender/Sender';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import senderBuilder from './Sender.builder';
import senderForm from './Sender.form';

class Sender extends BaseComponent {
  constructor(...args: any[]) {
    // @ts-expect-error args
    super(...args);
    this.noMainRef();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Avsender',
      type: 'sender',
      spellcheck: false,
    });
  }

  static editForm() {
    return senderForm();
  }

  static get builderInfo() {
    return senderBuilder();
  }

  init() {
    super.init();
    this.initPrefill();
  }

  initPrefill() {
    if (this.hasPrefill()) {
      // Call parent setValue so ignore prefillKey block on local setValue.
      super.setValue(this.component?.prefillValue);
    }
  }

  handleChange(value) {
    super.handleChange(value);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavSender
          role={this.component?.senderRole ?? 'person'}
          labels={this.component?.labels ?? {}}
          descriptions={this.component?.descriptions ?? {}}
          value={this.getValue()}
          onChange={this.handleChange.bind(this)}
          readOnly={this.getReadOnly()}
          fieldSize={this.getFieldSize()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default Sender;
