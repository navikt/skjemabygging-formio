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
import FormBuilderOptions from "../../Forms/form-builder-options";

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

function isCorrectOrder(beforeDate, afterDate, mayBeEqual = false) {
  return mayBeEqual ? beforeDate.isSameOrBefore(afterDate, "d") : beforeDate.isBefore(afterDate, "d");
}

export function validateToAndFromDate(beforeDate, inputDate, mayBeEqual) {
  if (isCorrectOrder(beforeDate, inputDate, mayBeEqual)) {
    return true;
  }
  const beforeDateAsString = beforeDate.format("DD.MM.YYYY");
  return mayBeEqual
    ? `Datoen kan ikke være tidligere enn fra-dato (${beforeDateAsString})`
    : `Datoen må være senere enn fra-dato (${beforeDateAsString})`;
}

export function validateEarliestAndLatestDate(earliestFromToday, latestFromToday, inputDate) {
  const earliestAllowedDate = !!earliestFromToday ? moment().add(earliestFromToday, "d") : undefined;
  const earliestAllowedDateAsString = earliestAllowedDate ? earliestAllowedDate.format("DD.MM.YYYY") : "";
  const latestAllowedDate = !!latestFromToday ? moment().add(latestFromToday, "d") : undefined;
  const latestAllowedDateAsString = latestAllowedDate ? latestAllowedDate.format("DD.MM.YYYY") : "";

  if (earliestAllowedDate && latestAllowedDate) {
    if (!isCorrectOrder(earliestAllowedDate, latestAllowedDate, true)) {
      return true;
    }
    return inputDate.isBefore(earliestAllowedDate, "d") || inputDate.isAfter(latestAllowedDate, "d")
      ? `Datoen kan ikke være tidligere enn ${earliestAllowedDateAsString} eller senere enn ${latestAllowedDateAsString}`
      : true;
  }

  if (earliestAllowedDate && inputDate.isBefore(earliestAllowedDate, "d")) {
    return `Datoen kan ikke være tidligere enn ${earliestAllowedDateAsString}`;
  }

  if (latestAllowedDate && inputDate.isAfter(latestAllowedDate, "d")) {
    return `Datoen kan ikke være senere enn ${latestAllowedDateAsString}`;
  }

  return true;
}

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

  validateDatePicker(
    input,
    submissionData,
    beforeDateInputKey,
    mayBeEqual,
    relativeEarliestAllowedDate,
    relativeLatestAllowedDate
  ) {
    if (!input) {
      return true;
    }

    const toAndFromDateValidation =
      beforeDateInputKey && submissionData[beforeDateInputKey]
        ? validateToAndFromDate(moment(submissionData[beforeDateInputKey]), moment(input), mayBeEqual)
        : true;

    const earliestAndLatestDateValidation =
      !!relativeEarliestAllowedDate || !!relativeLatestAllowedDate
        ? validateEarliestAndLatestDate(relativeEarliestAllowedDate, relativeLatestAllowedDate, moment(input))
        : true;

    if (typeof toAndFromDateValidation === "string") {
      return toAndFromDateValidation;
    }
    if (typeof earliestAndLatestDateValidation === "string") {
      return earliestAndLatestDateValidation;
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
    const excludeFromDisplay = [
      "placeholder",
      "hidden",
      "disabled",
      "tooltip",
      "customClass",
      "labelPosition",
      "tabindex",
      "hideLabel",
      "autofocus",
      "tableView",
      "modalEdit",
      "unique",
    ];

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
                    },
                  ],
                },
                {
                  type: "panel",
                  title: "Begrens periode relativt til dagens dato",
                  components: [
                    {
                      type: "number",
                      label: "Tidligst tillatt dato (antall dager fram/bak i tid)",
                      key: "earliestAllowedDate",
                      input: true,
                    },
                    {
                      type: "number",
                      label: "Senest tillatt dato (antall dager fram/bak i tid)",
                      key: "latestAllowedDate",
                      input: true,
                    },
                    {
                      type: "alertstripe",
                      key: "begrensTillattDatoInfo",
                      content:
                        "<div><p>Oppgi antall dager for å sette tidligste og seneste tillatte dato. Begrensningen er relativ til datoen skjemaet fylles ut. Bruk positive tall for å oppgi dager fram i tid, negative tall for å sette tillatt dato bakover i tid, og 0 for å sette dagens dato som tidligst/senest tillatt.</p><p>Eksempel: hvis tidligst tillatt er satt til -5, vil datoer før 10. august 2022 gi feilmelding når skjemaet fylles ut 15. august 2022</p></div>",
                      alerttype: "info",
                    },
                  ],
                },
                ...validationEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
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
