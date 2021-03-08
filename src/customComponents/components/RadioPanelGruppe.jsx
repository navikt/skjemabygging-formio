import React, { Component } from "react";
import ReactDOM from "react-dom";
import { RadioPanelGruppe } from "nav-frontend-skjema";

import radioEditForm from "formiojs/components/radio/Radio.form";
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
    const { component, translate } = this.props;
    const radios = component.values.map(({ label, value }, index) => ({
      label: translate(label),
      value,
      id: `${component.id}-${component.key}-${value}`,
      required: component.validate.required || undefined,
      radioRef: index === 0 ? this.props.radioRef : undefined,
    }));
    return (
      <RadioPanelGruppe
        aria-describedby={`${component.key}-error`}
        radios={radios}
        checked={this.state.value}
        legend={
          component.validate.required
            ? translate(component.label)
            : `${translate(component.label)} (${translate("valgfritt")})`
        }
        description={translate(component.description)}
        name={`data[${component.key}][${component.id}]`}
        onChange={(event) => this.setValue(event.target.value)}
      />
    );
  }
};

export default class RadioPanelGruppeComponent extends FormioReactComponent {
  input = React.createRef();

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.radiopanel;
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
      ...FormBuilderOptions.builder.basic.components.radiopanel.schema,
      ...extend,
    });
  }

  /**
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm(...extend) {
    return radioEditForm(...extend);
  }

  focus() {
    this.input.current.focus();
  }

  /**
   * This function is called when the DIV has been rendered and added to the DOM. You can now instantiate the react component.
   *
   * @param DOMElement
   * #returns ReactInstance
   */
  attachReact(element) {
    return ReactDOM.render(
      <RadioPanelGruppeWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        radioRef={this.input}
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
