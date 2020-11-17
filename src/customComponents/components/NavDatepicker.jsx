import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Datovelger } from "nav-datovelger";

import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import apiEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";

// import FormioReactComponent from "../FormioReactComponent.jsx";
import { ReactComponent as FormioReactComponent } from "react-formio";

require("moment/locale/nb.js"); // For datovelger

class DatovelgerWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({ value: this.props.value });
    }
  }

  render() {
    const { component, onChange, isValid, locale, readOnly, inputRef } = this.props;
    return (
      <Datovelger
        input={{ id: component.key, inputRef: inputRef }}
        id={component.id}
        valgtDato={this.state.value}
        onChange={(d) => {
          this.setState({ value: d });
          onChange(d);
        }}
        datoErGyldig={isValid}
        visÅrVelger={component.visArvelger}
        locale={locale}
        disabled={readOnly}
      />
    );
  }
}

const DatovelgerWrapperFunction = ({ component, onChange, value, isValid, locale, readOnly, inputRef }) => {
  const [dato, setDato] = useState();

  useEffect(() => {
    setDato(value);
  }, [value]);

  return (
    <Datovelger
      input={{ id: component.key, inputRef: inputRef }}
      id={component.id}
      valgtDato={dato}
      onChange={(d) => {
        setDato(d);
        onChange(d);
      }}
      datoErGyldig={isValid}
      visÅrVelger={component.visArvelger}
      locale={locale}
      disabled={readOnly}
    />
  );
};

export default class NavDatepicker extends FormioReactComponent {
  isValid = this.errors.length === 0;
  // reactElement = undefined;
  input = null;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: "Datovelger",
      group: "datoOgTid",
      weight: 10,
      icon: "calendar",
      schema: NavDatepicker.schema(),
    };
  }

  static schema(...extend) {
    return FormioReactComponent.schema(
      {
        type: "navDatepicker",
        label: "Dato (dd.mm.åååå)",
        validateOn: "blur",
        validate: {
          required: true,
        },
        input: true,
      },
      ...extend
    );
  }

  /*
   * Defines the settingsForm when editing a component in the builder.
   */
  static editForm() {
    const excludeFromDisplay = ["placeholder", "hidden", "disabled"];

    return {
      type: "hidden",
      key: "type",
      components: [
        {
          type: "tabs",
          key: "tabs",
          components: [
            {
              label: "Visning",
              key: "display",
              weight: 0,
              components: [
                {
                  type: "checkbox",
                  label: "Vis årvelger i kalender",
                  key: "visArvelger",
                  defaultValue: true,
                  input: true,
                },
                ...displayEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
              ],
            },
            {
              label: "Validering",
              key: "validation",
              weight: 20,
              components: validationEditForm,
            },
            {
              label: "Conditional",
              key: "conditional",
              weight: 40,
              components: conditionalEditForm,
            },
            {
              label: "API",
              key: "api",
              weight: 60,
              components: apiEditForm,
            },
          ],
        },
      ],
    };
  }

  renderReact(element) {
    return ReactDOM.render(
      <DatovelgerWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataForSetting || this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        checkValidity={this.checkValidity}
        isValid={this.isValid}
        locale={this.root.i18next.language}
        readOnly={this.options.readOnly}
        inputRef={(r) => (this.input = r)}
      />,
      element
    );
  }

  attachReact(element) {
    this.reactElement = element;
    return this.renderReact(element);
    // return this.reactElement;
  }

  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }

  checkValidity(data, dirty, rowData) {
    const isValid = super.checkValidity(data, dirty, rowData);
    this.componentIsValid(isValid);

    if (!isValid) {
      return false;
    }
    return this.validate(data, dirty, rowData);
  }

  componentIsValid = (isValid) => {
    if (isValid !== this.isValid) {
      this.isValid = !this.isValid;
      this.renderReact(this.reactElement);
    }
  };
}
