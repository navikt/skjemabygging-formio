import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Checkbox } from "nav-frontend-skjema";
import checkboxDataEditForm from "formiojs/components/checkbox/editForm/Checkbox.edit.data";
import dataEditFormComponent from "formiojs/components/_classes/component/editForm/Component.edit.data";
import checkboxDisplayEditForm from "formiojs/components/checkbox/editForm/Checkbox.edit.display";
import displayEditFormComponent from "formiojs/components/_classes/component/editForm/Component.edit.display";
import checkboxValidationEditForm from "formiojs/components/checkbox/editForm/Checkbox.edit.validation";
import validationEditFormComponent from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import apiEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";
import layoutEditForm from "formiojs/components/_classes/component/editForm/Component.edit.layout";
import logicEditForm from "formiojs/components/_classes/component/editForm/Component.edit.logic";

import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import FormioReactComponent from "../FormioReactComponent";
import { joinDefaultAndCustomEditForm } from "../util/joinNewEditForm";

/**
 * The wrapper for our custom React component
 *
 * It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 */
const CheckboxWrapper = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  setValue = (value) => {
    this.setState({ value: value }, () => this.props.onChange(this.state.value));
  };

  render() {
    const component = this.props.component;
    return (
      <Checkbox
        checkboxRef={this.props.checkboxRef}
        aria-describedby={`${component.key}-error`}
        label={component.label}
        onChange={(event) => this.setValue(event.target.value)}
        required={component.validate.required}
      />
    );
  }
};

export default class CheckboxComponent extends FormioReactComponent {
  input = null;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    const { title, key, icon } = FormBuilderOptions.builder.basic.components.checkboxDesignSystem;
    return {
      title,
      icon,
      group: "basic",
      key,
      documentation: "",
      schema: CheckboxComponent.schema(),
      weight: 0,
    };
  }

  /**
   * This function is the default settings for the component. At a minimum you want to set the type to the registered
   * type of your component (i.e. when you call Components.setComponent('type', MyComponent) these types should match.
   *
   * @param sources
   * @returns {*}
   */
  static schema() {
    return FormioReactComponent.schema(FormBuilderOptions.builder.basic.components.checkboxDesignSystem.schema);
  }

  /**
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm() {
    return {
      type: "hidden",
      key: "type",
      components: [
        {
          type: "tabs",
          key: "tabs",
          components: [
            {
              label: "Display",
              key: "display",
              components: joinDefaultAndCustomEditForm(displayEditFormComponent, checkboxDisplayEditForm),
            },
            {
              label: "Data",
              key: "data",
              components: joinDefaultAndCustomEditForm(dataEditFormComponent, checkboxDataEditForm).filter(
                (component) => component.key !== "defaultValue"
              ),
            },
            {
              label: "Validation",
              key: "validation",
              components: joinDefaultAndCustomEditForm(validationEditFormComponent, checkboxValidationEditForm),
            },
            {
              label: "API",
              key: "api",
              components: apiEditForm,
            },
            {
              label: "Conditional",
              key: "conditional",
              components: conditionalEditForm,
            },
            {
              label: "Logic",
              key: "logic",
              components: logicEditForm,
            },
            {
              label: "Layout",
              key: "layout",
              components: layoutEditForm,
            },
          ],
        },
      ],
    };
  }

  focus() {
    if (this.input) this.input.focus();
  }

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    return ReactDOM.render(
      <CheckboxWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        checkboxRef={(r) => (this.input = r)}
      />,
      element
    );
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
}
