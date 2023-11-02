import { createRoot } from 'react-dom/client';
import ReactComponent from './ReactComponent';

const FormioReactComponent = class extends ReactComponent {
  input = null;

  attachReact(element, _setReactInstance) {
    const root = createRoot(element);
    this.renderReact(root);

    return root;
  }

  detachReact(element) {
    if (element && this.reactInstance) {
      setTimeout(() => {
        this.reactInstance.unmount();
        this.reactInstance = null;
      });
    }
  }

  /**
   * Override this function
   *
   * @param element
   */
  renderReact(_element) {}

  setValue(value, flags = {}) {
    const redraw = JSON.stringify(value) !== JSON.stringify(this.dataForSetting);
    super.setValue(value, flags);
    if (redraw) {
      super.redraw();
    }

    this.updateValue(value, flags);
  }

  getValue() {
    return this.dataValue;
  }

  focus() {
    if (this.input) {
      // @ts-ignore
      this.input.focus();
    }
  }
};

export default FormioReactComponent;
