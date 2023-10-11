import ReactComponent from "./ReactComponent";
import { createRoot } from "react-dom/client";

const FormioReactComponent = class extends ReactComponent {
  input = null;

  attachReact(element, setReactInstance) {
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
  renderReact(element) {}

  setValue(value, flags = {}) {
    if (!this.shouldSetValue) {
      super.setValue(value, flags);
      super.redraw();
    }
  }

  focus() {
    if (this.input) {
      // @ts-ignore
      this.input.focus();
    }
  }
};

export default FormioReactComponent;
