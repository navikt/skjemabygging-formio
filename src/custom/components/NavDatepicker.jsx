import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Datovelger } from "nav-datovelger";
import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import FormioReactComponent from "../FormioReactComponent";

const DatovelgerWrapper = ({ component, onChange, value, isValid, locale }) => {
  const [dato, setDato] = useState(value || "");

  return (
    <Datovelger
      id={component.id}
      valgtDato={dato}
      onChange={(d) => {
        setDato(d);
        onChange(d);
      }}
      datoErGyldig={isValid}
      visÅrVelger={component.visArvelger}
      locale={locale}
    />
  );
};

export default class NavDatepicker extends FormioReactComponent {
  isValid = this.errors.length === 0;
  reactElement = undefined;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    return {
      title: "Datovelger",
      group: "advanced",
      icon: "calendar",
      schema: NavDatepicker.schema(),
    };
  }

  static schema(...extend) {
    return FormioReactComponent.schema(
      {
        type: "navDatepicker",
        label: "Dato",
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
                  label: "Vis ukenumre i kalender",
                  key: "visUkenumre",
                  defaultValue: true,
                  input: true,
                },
                {
                  type: "checkbox",
                  label: "Vis årvelger i kalender",
                  key: "visArvelger",
                  defaultValue: true,
                  input: true,
                },
                ...displayEditForm,
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
          ],
        },
      ],
    };
  }

  renderReact(element) {
    return ReactDOM.render(
      <DatovelgerWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        checkValidity={this.checkValidity}
        isValid={this.isValid}
        locale={this.root.i18next.language}
      />,
      element
    );
  }

  attachReact(element) {
    console.log(this);
    this.reactElement = element;
    return this.renderReact(element);
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
  }
}
