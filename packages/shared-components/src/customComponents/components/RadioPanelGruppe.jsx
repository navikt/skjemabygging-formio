import React, { Component } from "react";
import ReactDOM from "react-dom";
import { RadioPanelGruppe } from "nav-frontend-skjema";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

import radioEditForm from "formiojs/components/radio/Radio.form";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import FormioReactComponent from "../FormioReactComponent";
import { descriptionPositionField } from "./fields/descriptionPositionField";
import { guid } from "../../util/guid";

/**
 * NB! This component is no longer used, but saved for now, in case we manage to fix FormioReactComponent.
 *
 * The reason for stopping to use this component is that it is buggy, i.e. with clearOnHide functionality
 * and loading values when going back from the summary page.
 */

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
    const { descriptionPosition } = component;
    let renderDescriptionAboveLabel = component.description && descriptionPosition === "above";
    let descriptionId;
    if (renderDescriptionAboveLabel) {
      descriptionId = guid();
    }
    const radios = component.values.map(({ label, value }, index) => ({
      label: translate(label),
      value,
      id: `${component.id}-${component.key}-${value}`,
      required: component.validate.required || undefined,
      radioRef: index === 0 ? this.props.radioRef : undefined,
    }));
    return (
      <>
        {renderDescriptionAboveLabel && (
          <p className="skjemagruppe__description" id={descriptionId}>
            {component.description}
          </p>
        )}
        <RadioPanelGruppe
          aria-describedby={descriptionId || `${component.key}-error`}
          radios={radios}
          checked={this.state.value}
          legend={
            component.validate.required
              ? translate(component.label)
              : `${translate(component.label)} (${translate(TEXTS.common.optional)})`
          }
          description={renderDescriptionAboveLabel ? undefined : translate(component.description)}
          name={`data[${component.key}][${component.id}]`}
          onChange={(event) => this.setValue(event.target.value)}
        />
      </>
    );
  }
};

class RadioPanelGruppeComponent extends FormioReactComponent {
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
    return radioEditForm([
      ...extend,
      {
        label: "Display",
        key: "display",
        components: [
          descriptionPositionField,
          {
            key: "labelPosition",
            ignore: true,
          },
          {
            key: "optionsLabelPosition",
            ignore: true,
          },
          {
            key: "tooltip",
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
            key: "inline",
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
          {
            key: "dataType",
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

export { RadioPanelGruppeWrapper };
export default RadioPanelGruppeComponent;
