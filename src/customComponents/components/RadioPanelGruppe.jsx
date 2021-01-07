import React, { Component } from "react";
import ReactDOM from "react-dom";
import { RadioPanelGruppe } from "nav-frontend-skjema";
import dataEditForm from "formiojs/components/_classes/component/editForm/Component.edit.data";
import radioDataEditForm from "formiojs/components/radio/editForm/Radio.edit.data";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import radioDisplayEditForm from "formiojs/components/radio/editForm/Radio.edit.display";
import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import radioValidationEditForm from "formiojs/components/radio/editForm/Radio.edit.validation";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import apiEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";
import layoutEditForm from "formiojs/components/_classes/component/editForm/Component.edit.layout";
import logicEditForm from "formiojs/components/_classes/component/editForm/Component.edit.logic";

import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import FormioReactComponent from "../FormioReactComponent";

/**
 * The wrapper for our custom React component
 *
 * It needs to have two things.
 * 1. The value should be stored is state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 */
const RadioPanelGruppeWrapper = class extends Component {
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
    const radios = component.values.map(({ label, value }, index) => ({
      label,
      value,
      id: `${component.key}${value}`,
    }));
    return (
      <RadioPanelGruppe
        aria-describedby={`${component.key}-error`}
        radios={radios}
        checked={this.state.value}
        legend={component.label}
        description={component.description}
        name={`data[${component.key}][${component.id}]`}
        onChange={(event) => this.setValue(event.target.value)}
      />
    );
  }
};

function joinDefaultAndCustomEditForm(defaultEditForm, customEditForm) {
  return [
    ...customEditForm,
    ...defaultEditForm.filter(
      (component) => !customEditForm.find((customComponent) => customComponent.key === component.key)
    ),
  ].filter((component) => !component.ignore);
}

export default class RadioPanelGruppeComponent extends FormioReactComponent {
  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    const { title, key, icon } = FormBuilderOptions.builder.basic.components.radiopanel;
    return {
      title,
      icon,
      group: "basic",
      key,
      documentation: "",
      schema: RadioPanelGruppeComponent.schema(),
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
    return FormioReactComponent.schema(FormBuilderOptions.builder.basic.components.radiopanel.schema);
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
              components: joinDefaultAndCustomEditForm(displayEditForm, radioDisplayEditForm).filter(
                (component) => component.key !== "hideLabel"
              ),
            },
            {
              label: "Data",
              key: "data",
              components: joinDefaultAndCustomEditForm(dataEditForm, radioDataEditForm).filter(
                (component) => component.key !== "defaultValue"
              ),
            },
            {
              label: "Validation",
              key: "validation",
              components: joinDefaultAndCustomEditForm(validationEditForm, radioValidationEditForm),
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
    document.getElementsByName(`data[${this.component.key}][${this.component.id}]`)[0].focus();
  }

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    console.log("attachReact", element);
    return ReactDOM.render(
      <RadioPanelGruppeWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
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
    console.log("detachReact", element);
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }
}
