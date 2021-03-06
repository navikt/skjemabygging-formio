import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Checkbox } from "nav-frontend-skjema";
import CheckboxEditForm from "formiojs/components/checkbox/Checkbox.form";

import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import FormioReactComponent from "../FormioReactComponent";
import { descriptionPositionField } from "./fields/descriptionPositionField";

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
    const { component, translate } = this.props;
    return (
      <Checkbox
        checkboxRef={this.props.checkboxRef}
        aria-describedby={`${component.key}-error`}
        label={translate(component.label)}
        onChange={(event) => this.setValue(!!this.state.value ? null : "ja")}
        required={component.validate.required}
        checked={this.state.value === "ja"}
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
          descriptionPositionField,
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
        translate={(text) => this.t(text)}
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
