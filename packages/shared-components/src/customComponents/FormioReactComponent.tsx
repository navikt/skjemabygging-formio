import ReactComponent from "./ReactComponent";
import { createRoot } from "react-dom/client";

const FormioReactComponent = class extends ReactComponent {
  input = null;

  attachReact(element, setReactInstance) {
    console.log("attachReact", element, this.reactInstance);
    const root = createRoot(element);
    this.renderReact(root);
    //setReactInstance(root);
    return root;
  }

  detachReact(element) {
    console.log("detachReact", element, this.reactInstance);
    if (element && this.reactInstance) {
      setTimeout(() => {
        this.reactInstance.unmount();
        //this.reactInstance = null;
      });
    }
  }

  /**
   * Override this function
   *
   * @param element
   */
  renderReact(element) {}

  clearOnHide() {
    super.clearOnHide();
    /*
    // clearOnHide defaults to true for old forms (without the value set) so only trigger if the value is false.
    if (this.component.clearOnHide !== false && !this.options.readOnly && !this.options.showHiddenFields) {
      if (!this.visible) {
        this.deleteValue();
      } else if (!this.hasValue() && this.shouldAddDefaultValue) {
        // If shown, ensure the default is set.
        this.setValue(this.defaultValue, {
          noUpdateEvent: true,
        });
      }
    }*/
  }

  focus() {
    if (this.input) {
      // @ts-ignore
      this.input.focus();
    }
  }
};

export default FormioReactComponent;
