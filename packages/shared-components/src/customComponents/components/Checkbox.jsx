import { Checkbox } from "@navikt/ds-react";
import CheckboxEditForm from "formiojs/components/checkbox/Checkbox.form";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import FormBuilderOptions from "../../Forms/form-builder-options";
import FormioReactComponent from "../FormioReactComponent";
import { advancedDescription } from "./fields/advancedDescription.js";

/**
 * The wrapper for our custom React component
 *
 * It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 */
const CheckboxWrapper = ({ component, checkboxRef, translate, onChange, value }) => {
  const [isChecked, setIsChecked] = useState();

  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  return (
    <Checkbox
      checkboxRef={checkboxRef}
      aria-describedby={`${component.key}-error`}
      label={translate(component.label)}
      onChange={() => {
        setIsChecked(!!isChecked ? null : "ja");
        onChange(!!isChecked ? null : "ja");
      }}
      required={component.validate.required}
      checked={isChecked === "ja"}
    />
  );
};

export default class CheckboxComponent extends FormioReactComponent {
  input = null;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.navCheckbox;
  }

  /**
   * This function is the default settings for the component. At a minimum you want to set the type to the registered
   * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
   *
   * @param sources
   * @returns {*}
   */
  static schema(...extend) {
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.basic.components.navCheckbox.schema,
      ...extend,
    });
  }

  /**
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm(...extend) {
    return CheckboxEditForm([
      ...extend,
      {
        label: "Display",
        key: "display",
        components: [
          ...advancedDescription,
          {
            key: "tooltip",
            ignore: true,
          },
          {
            key: "shortcut",
            ignore: true,
          },
          {
            key: "inputType",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "tabindex",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "autofocus",
            ignore: true,
          },
          {
            key: "disabled",
            ignore: true,
          },
          {
            key: "tableView",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
          { key: "hideLabel", ignore: true },
        ],
      },
      {
        key: "data",
        components: [
          {
            key: "multiple",
            ignore: true,
          },
          {
            key: "persistent",
            ignore: true,
          },
          {
            key: "inputFormat",
            ignore: true,
          },
          {
            key: "protected",
            ignore: true,
          },
          {
            key: "dbIndex",
            ignore: true,
          },
          {
            key: "case",
            ignore: true,
          },
          {
            key: "encrypted",
            ignore: true,
          },
          {
            key: "redrawOn",
            ignore: true,
          },
          {
            key: "calculateServer",
            ignore: true,
          },
          {
            key: "allowCalculateOverride",
            ignore: true,
          },
        ],
      },
      {
        key: "validation",
        components: [
          {
            key: "unique",
            ignore: true,
          },
        ],
      },
      {
        key: "api",
        components: [
          { key: "tags", ignore: true },
          { key: "properties", ignore: true },
        ],
      },
      {
        key: "logic",
        ignore: true,
        components: false,
      },
      {
        key: "layout",
        ignore: true,
        components: false,
      },
    ]);
  }

  focus() {
    if (this.input) this.input.focus();
  }

  renderReact(element) {
    return ReactDOM.render(
      <CheckboxWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataForSetting || this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        checkboxRef={(r) => (this.input = r)}
        translate={(text) => this.t(text)}
      />,
      element
    );
  }

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    this.reactElement = element;
    this.renderReact(element);
    return this.reactElement;
  }

  /**
   * Automatically detach any react components.
   *
   * @param element
   */
  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }

  getValue() {
    return this.dataValue;
  }

  setValue(value, flags = {}) {
    this.dataForSetting = value;
    if (this.reactElement) {
      this.renderReact(this.reactElement);
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
    }
    return super.setValue(value, flags);
  }

  checkValidity(data, dirty, rowData) {
    return super.checkValidity(data, dirty, rowData);
  }
}
