import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Datovelger } from "nav-datovelger";
import moment from "moment";

import validationEditForm from "formiojs/components/_classes/component/editForm/Component.edit.validation";
import displayEditForm from "formiojs/components/_classes/component/editForm/Component.edit.display";
import conditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import apiEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";
import { getContextComponents } from "formiojs/utils/utils";

import FormioReactComponent from "../FormioReactComponent.jsx";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

require("moment/locale/nb.js"); // For datovelger

const DatovelgerWrapper = ({ component, onChange, value, isValid, locale, readOnly, inputRef }) => {
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
  reactElement = undefined;
  input = null;

  /**
   * This function tells the form builder about your component. It's name, icon and what group it should be in.
   *
   * @returns {{title: string, icon: string, group: string, documentation: string, weight: number, schema: *}}
   */
  static get builderInfo() {
    const { title, key, icon } = FormBuilderOptions.builder.datoOgTid.components.datoVelger;
    return {
      title,
      icon,
      key,
      documentation: "",
      weight: 0,
      schema: NavDatepicker.schema(),
    };
  }

  isAfterBeforeDate(beforeDate, input, mayBeEqual) {
    return mayBeEqual ? beforeDate.isSameOrBefore(input, 'd') : beforeDate.isBefore(input, 'd');
  }

  validateDatePicker(input, submissionData, beforeDateInputKey, mayBeEqual, relativeEarliestAllowedDate, relativeLatestAllowedDate) {
    if (!input) {
      return true;
    }

    const inputAsMoment = moment(input);

    if (beforeDateInputKey && submissionData[beforeDateInputKey]) {
      const beforeDateAsMoment = moment(submissionData[beforeDateInputKey]);
      const beforeDateAsString = beforeDateAsMoment.format("DD.MM.YYYY");
      if(!this.isAfterBeforeDate(beforeDateAsMoment, inputAsMoment, mayBeEqual)) {
        return mayBeEqual ? `Datoen kan ikke være før fra-dato (${beforeDateAsString})` : `Datoen må være senere enn fra-dato (${beforeDateAsString})`;
      }
    }

    const earliestAllowedDate = relativeEarliestAllowedDate !== undefined ? moment().add(relativeEarliestAllowedDate, 'd') : undefined;
    const earliestAllowedDateAsString = earliestAllowedDate ? earliestAllowedDate.format("DD.MM.YYYY") : "";
    const latestAllowedDate = relativeLatestAllowedDate !== undefined ? moment().add(relativeLatestAllowedDate, 'd') : undefined;
    const latestAllowedDateAsString = latestAllowedDate ? latestAllowedDate.format("DD.MM.YYYY") : "";

    if(earliestAllowedDate && latestAllowedDate) {
      return inputAsMoment.isBefore(earliestAllowedDate, 'd') || inputAsMoment.isAfter(latestAllowedDate, 'd')
        ? `Datoen må være mellom ${earliestAllowedDateAsString} og ${latestAllowedDateAsString}` : true;
    }

    if(earliestAllowedDate && inputAsMoment.isBefore(earliestAllowedDate, 'd')) {
      return `Datoen kan ikke være tidligere enn ${earliestAllowedDateAsString}`;
    }

    if(latestAllowedDate && inputAsMoment.isAfter(latestAllowedDate, 'd')) {
      return `Datoen kan ikke være senere enn ${latestAllowedDateAsString}`;
    }

    return true;
  }

  static schema() {
    return FormioReactComponent.schema(FormBuilderOptions.builder.datoOgTid.components.datoVelger.schema);
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
              components: [
                {
                  type: "panel",
                  title: "Fra-til-dato",
                  components: [
                    {
                      type: "select",
                      input: true,
                      label: "Datofelt for fra-dato",
                      key: "beforeDateInputKey",
                      dataSrc: "custom",
                      valueProperty: "value",
                      data: {
                        custom(context) {
                          return getContextComponents(context);
                        },
                      },
                    },
                    {
                      type: "checkbox",
                      label: "Kan være lik",
                      key: "mayBeEqual",
                      defaultValue: false,
                      input: true,
                    }
                  ]
                },
                {
                  type: "number",
                  label: "Dato kan ikke være tidligere enn (dagens dato pluss x dager)",
                  key: "earliestAllowedDate",
                  input: true,
                },
                {
                  type: "number",
                  label: "Dato kan ikke være senere enn (dagens dato pluss x dager)",
                  key: "latestAllowedDate",
                  input: true,
                },
                ...validationEditForm,
              ],
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

  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  attachReact(element) {
    this.reactElement = element;
    this.renderReact(element);
    return this.reactElement;
  }

  detachReact(element) {
    if (element) {
      ReactDOM.unmountComponentAtNode(element);
    }
  }

  getValue() {
    return this.dataValue;
  }

  setValue(value) {
    this.dataForSetting = value;
    if (this.reactElement) {
      this.renderReact(this.reactElement);
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
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
