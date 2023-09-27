import ReactComponent from "./ReactComponent";
import { createRoot } from "react-dom/client";

const FormioReactComponent = class extends ReactComponent {
  rootElement;
  input = null;

  constructor(component, options, data) {
    super(component, options, data);
    this.reactInstance = null;
    this.rootElement = undefined;
  }

  attachReact(element) {
    if (!this.rootElement) {
      this.rootElement = createRoot(element);
    }
    this.renderReact(this.rootElement);
    return this.rootElement;
  }

  detachReact(element) {
    if (element && this.rootElement) {
      setTimeout(() => {
        this.rootElement.unmount();
        this.rootElement = undefined;
      });
    }
  }

  /**
   * Override this function
   *
   * @param element
   */
  renderReact(element) {}

  setValue(value) {
    super.setValue(value);
    if (this.rootElement) {
      this.renderReact(this.rootElement);
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
